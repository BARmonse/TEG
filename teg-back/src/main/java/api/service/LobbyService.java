package api.service;

import api.dto.LobbyEvent;
import api.model.Game;
import api.model.GamePlayer;
import api.model.GameStatus;
import api.model.User;
import api.repository.GameRepository;
import api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LobbyService {
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
            GamePlayer gamePlayer = GamePlayer.builder()
                    .game(game)
                    .user(user)
                    .turnOrder(game.getPlayers().size() + 1)
                    .build();

            game.getPlayers().add(gamePlayer);
            gameRepository.save(game);

            // Notify all clients about the new player
            notifyLobbyEvent(LobbyEvent.builder()
                    .type(LobbyEvent.LobbyEventType.USER_JOINED)
                    .username(username)
                    .gameId(gameId)
                    .message(username + " has joined the game")
                    .build());
        }
    }

    @Transactional
    public void leaveGame(Long gameId, String username) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        game.getPlayers().removeIf(player -> player.getUser().getId().equals(user.getId()));
        gameRepository.save(game);

        // If the game creator leaves, cancel the game
        if (game.getCreatedBy().getId().equals(user.getId())) {
            game.setStatus(GameStatus.CANCELLED);
            gameRepository.save(game);
            
            notifyLobbyEvent(LobbyEvent.builder()
                    .type(LobbyEvent.LobbyEventType.GAME_CANCELLED)
                    .gameId(gameId)
                    .message("Game cancelled: Creator left the game")
                    .build());
        } else {
            notifyLobbyEvent(LobbyEvent.builder()
                    .type(LobbyEvent.LobbyEventType.USER_LEFT)
                    .username(username)
                    .gameId(gameId)
                    .message(username + " has left the game")
                    .build());
        }
    }

    @Transactional
    public void startGame(Long gameId, String username) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify that the user is the game creator
        if (!game.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the game creator can start the game");
        }

        // Verify minimum number of players (at least 2)
        if (game.getPlayers().size() < 2) {
            throw new RuntimeException("Not enough players to start the game");
        }

        game.setStatus(GameStatus.IN_PROGRESS);
        gameRepository.save(game);

        notifyLobbyEvent(LobbyEvent.builder()
                .type(LobbyEvent.LobbyEventType.GAME_STARTED)
                .gameId(gameId)
                .message("Game has started!")
                .build());
    }

    private void notifyLobbyEvent(LobbyEvent event) {
        messagingTemplate.convertAndSend("/topic/game/" + event.getGameId(), event);
    }
} 