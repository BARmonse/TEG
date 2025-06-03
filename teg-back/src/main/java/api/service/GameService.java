package api.service;

import api.dto.GameDTO;
import api.model.*;
import api.repository.GameRepository;
import api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {
    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    @Transactional
    public GameDTO createGame(String name, Integer maxPlayers, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Game game = Game.builder()
                .name(name)
                .maxPlayers(maxPlayers)
                .status(GameStatus.WAITING)
                .createdBy(creator)
                .players(new HashSet<>())
                .build();

        // Add creator as first player with red color
        GamePlayer gamePlayer = GamePlayer.builder()
                .id(new GamePlayerId(null, creator.getId()))  // Set gameId to null as it will be set after save
                .game(game)
                .user(creator)
                .color(PlayerColor.RED)
                .turnOrder(1)
                .build();

        game.getPlayers().add(gamePlayer);
        game = gameRepository.save(game);
        
        // Update the GamePlayerId with the new game ID
        gamePlayer.getId().setGameId(game.getId());

        return convertToDTO(game);
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getAvailableGames() {
        return gameRepository.findByStatus(GameStatus.WAITING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameDTO getGame(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return convertToDTO(game);
    }

    @Transactional
    public void joinGame(Long gameId, String username) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game is not in waiting state");
        }

        if (game.getPlayers().size() >= game.getMaxPlayers()) {
            throw new RuntimeException("Game is full");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already in the game
        boolean isAlreadyInGame = game.getPlayers().stream()
                .anyMatch(player -> player.getUser().getId().equals(user.getId()));

        if (!isAlreadyInGame) {
            // Determine the next available color
            PlayerColor nextColor = getNextAvailableColor(game);
            
            GamePlayer gamePlayer = GamePlayer.builder()
                    .id(new GamePlayerId(game.getId(), user.getId()))
                    .game(game)
                    .user(user)
                    .color(nextColor)
                    .turnOrder(game.getPlayers().size() + 1)
                    .build();

            game.getPlayers().add(gamePlayer);
            gameRepository.save(game);
        }
    }

    private PlayerColor getNextAvailableColor(Game game) {
        Set<PlayerColor> usedColors = game.getPlayers().stream()
                .map(GamePlayer::getColor)
                .collect(Collectors.toSet());

        return Arrays.stream(PlayerColor.values())
                .filter(color -> !usedColors.contains(color))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No available colors"));
    }

    private GameDTO convertToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .maxPlayers(game.getMaxPlayers())
                .currentPlayers(game.getPlayers().size())
                .status(game.getStatus().toString())  // Use toString() instead of name().toLowerCase()
                .createdAt(game.getCreatedAt())
                .build();
    }
} 