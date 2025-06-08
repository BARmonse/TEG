package api.controller;

import api.dto.CreateGameRequest;
import api.dto.GameDTO;
import api.dto.GamePlayerDTO;
import api.dto.ColorDTO;
import api.model.Game;
import api.service.GameService;
import api.util.GameDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create")
    public ResponseEntity<GameDTO> createGame(
            @Valid @RequestBody CreateGameRequest request,
            Authentication authentication
    ) {
        log.info("Creating game with request: {}", request);
        try {
            GameDTO game = gameService.createGame(
                request.getGameName(),
                request.getMaxPlayers(),
                authentication.getName()
            );
            
            // Broadcast to all users via WebSocket
            messagingTemplate.convertAndSend(
                "/topic/game-updates",
                Map.of("type", "GAME_UPDATED", "payload", game)
            );

            return ResponseEntity.ok(game);
        } catch (Exception e) {
            log.error("Error creating game", e);
            throw new RuntimeException("Failed to create game: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<GameDTO>> getAvailableGames() {
        try {
            List<GameDTO> games = gameService.getAvailableGames();
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error getting games", e);
            throw new RuntimeException("Failed to get games: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGame(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(GameDtoMapper.toGameDTO(gameService.getGameOrThrowException(id)));
        } catch (Exception e) {
            log.error("Error getting game", e);
            throw new RuntimeException("Failed to get game: " + e.getMessage());
        }
    }

    @PostMapping("/join/{gameId}/{userId}")
    public ResponseEntity<GameDTO> joinGame(
            @PathVariable("gameId") Long gameId,
            @PathVariable("userId") Long userId
    ) {
        try {
            Game game = gameService.joinGame(gameId, userId);
            GameDTO dto = GameDtoMapper.toGameDTO(game);

            GamePlayerDTO newPlayer = dto.getPlayers().stream()
                .filter(gp -> gp.getUser().getId().equals(userId))
                .findFirst().orElseThrow(() -> new RuntimeException("User not found"));

            // Broadcast only the new GamePlayerDTO and gameId
            messagingTemplate.convertAndSend(
                "/topic/game-updates",
                Map.of(
                    "type", "USER_JOINED",
                    "payload", Map.of(
                        "gameId", game.getId(),
                        "player", newPlayer
                    )
                )
            );

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error joining game", e);
            throw new RuntimeException("Failed to join game: " + e.getMessage());
        }
    }

    @PostMapping("leave/{gameId}/{userId}")
    public ResponseEntity<GameDTO> leaveGame(
            @PathVariable("gameId") Long gameId,
            @PathVariable("userId") Long userId
    ) {
        Game game = gameService.leaveGame(gameId, userId);
        // Broadcast only the userId and gameId
        messagingTemplate.convertAndSend(
            "/topic/game-updates",
            Map.of(
                "type", "USER_LEFT",
                "payload", Map.of(
                    "gameId", gameId,
                    "userId", userId
                )
            )
        );
        return ResponseEntity.ok(GameDtoMapper.toGameDTO(game));
    }

    @PostMapping("/color/{gameId}/{userId}")
    public ResponseEntity<GamePlayerDTO> updatePlayerColor(
            @PathVariable("gameId") Long gameId,
            @PathVariable("userId") Long userId,
            @RequestBody ColorDTO colorDTO
    ) {
        String color = colorDTO.getColor();
        GamePlayerDTO updatedPlayer = gameService.updatePlayerColor(gameId, userId, color);
        // Broadcast color change
        messagingTemplate.convertAndSend(
            "/topic/game-updates",
            Map.of(
                "type", "PLAYER_COLOR_CHANGED",
                "payload", Map.of(
                    "gameId", gameId,
                    "userId", userId,
                    "color", color
                )
            )
        );
        return ResponseEntity.ok(updatedPlayer);
    }

    @PostMapping("/start/{gameId}/{userId}")
    public ResponseEntity<GameDTO> startGame(
            @PathVariable("gameId") Long gameId,
            @PathVariable("userId") Long userId
    ) {
        Game game = gameService.startGame(gameId, userId);
        return ResponseEntity.ok(GameDtoMapper.toGameDTO(game));
    }
} 