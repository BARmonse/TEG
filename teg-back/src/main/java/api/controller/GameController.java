package api.controller;

import api.dto.CreateGameRequest;
import api.dto.GameDTO;
import api.service.GameService;
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
        log.info("Getting available games");
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
        log.info("Getting game with id: {}", id);
        try {
            GameDTO game = gameService.getGame(id);
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            log.error("Error getting game", e);
            throw new RuntimeException("Failed to get game: " + e.getMessage());
        }
    }
} 