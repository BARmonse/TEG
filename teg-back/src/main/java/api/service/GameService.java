package api.service;

import api.dto.GameDTO;
import api.dto.GamePlayerDTO;
import api.model.*;
import api.repository.GameRepository;
import api.repository.UserRepository;
import api.util.GameDtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {
    private final SimpMessagingTemplate messagingTemplate;
    private final GameRepository gameRepository;
    private final UserService userService;
    private final CountryService countryService;
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

        return GameDtoMapper.toGameDTO(game);
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getAvailableGames() {
        return gameRepository.findByStatus(GameStatus.WAITING).stream()
                .map(GameDtoMapper::toGameDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Game getGameOrThrowException(Long id) {
        return (gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found")));
    }

    @Transactional
    public Game joinGame(Long gameId, Long userId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game is not in waiting state");
        }

        if (game.getPlayers().size() >= game.getMaxPlayers()) {
            throw new RuntimeException("Game is full");
        }

        User user = userService.findByIdOrThrowException(userId);

        // Check if user is already in the game
        boolean isAlreadyInGame = game.getPlayers().stream()
                .anyMatch(player -> player.getUser().getId().equals(user.getId()));

        if (isAlreadyInGame) {
            throw new RuntimeException("User is already in game");
        }

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
        game = gameRepository.save(game);

        messagingTemplate.convertAndSend(
                "/topic/game-updates",
                Map.of(
                        "type", "USER_JOINED",
                        "payload", Map.of(
                                "gameId", game.getId(),
                                "user", GameDtoMapper.toUserDTO(user))
                )
        );

        return game;
    }

    @Transactional
    public Game leaveGame(Long gameId, Long userId) {
        try {
            Game game = gameRepository.findById(gameId)
                    .orElseThrow(() -> new RuntimeException("Game not found"));
            boolean isCreator = game.getCreatedBy().getId().equals(userId);
            if (isCreator) {
                // Cancel the game: set status, remove all players
                game.setStatus(GameStatus.CANCELLED);
                game.getPlayers().clear();
                game = gameRepository.save(game);
                // Broadcast cancellation
                messagingTemplate.convertAndSend(
                    "/topic/game-updates",
                    Map.of(
                        "type", "GAME_CANCELLED",
                        "payload", Map.of(
                            "gameId", gameId,
                            "message", "The game was cancelled because the creator left."
                        )
                    )
                );
                return game;
            } else {
                game.getPlayers().removeIf(gp -> gp.getUser().getId().equals(userId));
                return gameRepository.save(game);
            }
        } catch (Exception e) {
            log.error("User {} could not leave game {}. Exception was: {}.", userId, gameId, e.getMessage());
            throw new RuntimeException("Error leaving game");
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

    @Transactional
    public GamePlayerDTO updatePlayerColor(Long gameId, Long userId, String color) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        PlayerColor requestedColor = PlayerColor.valueOf(color.toUpperCase());
        // Enforce uniqueness: check if any other player has this color
        boolean colorTaken = game.getPlayers().stream()
                .anyMatch(gp -> !gp.getUser().getId().equals(userId) && gp.getColor() == requestedColor);
        if (colorTaken) {
            throw new RuntimeException("Color already taken by another player");
        }
        GamePlayer gamePlayer = game.getPlayers().stream()
                .filter(gp -> gp.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Player not found in game"));
        gamePlayer.setColor(requestedColor);
        gameRepository.save(game);
        return GameDtoMapper.toGamePlayerDTO(gamePlayer);
    }

    @Transactional
    public Game startGame(Long gameId, Long creatorId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        if (!game.getCreatedBy().getId().equals(creatorId)) {
            throw new RuntimeException("Only the creator can start the game");
        }
        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game already started or finished");
        }

        // Assign countries
        List<Country> allCountries = countryService.getAllCountries();
        Collections.shuffle(allCountries);
        List<GamePlayer> players = new ArrayList<>(game.getPlayers());
        int numPlayers = players.size();
        for (int i = 0; i < allCountries.size(); i++) {
            GamePlayer player = players.get(i % numPlayers);
            Country country = allCountries.get(i);

            PlayerCountryId pcId = new PlayerCountryId(
                    player.getId().getGameId(),
                    player.getId().getUserId(),
                    country.getId()
            );
            PlayerCountry playerCountry = new PlayerCountry(pcId, player, country, 1);
            player.getPlayerCountries().add(playerCountry);
        }

        // Assign objectives
        List<Objective> allObjectives = new ArrayList<>(Arrays.asList(Objective.values()));
        Collections.shuffle(allObjectives);
        // Track which colors are in play
        Set<PlayerColor> colorsInPlay = players.stream().map(GamePlayer::getColor).collect(Collectors.toSet());
        for (GamePlayer player : players) {
            Objective assigned = null;
            Iterator<Objective> it = allObjectives.iterator();
            while (it.hasNext()) {
                Objective obj = it.next();
                if (obj.name().startsWith("DESTROY_")) {
                    // Only assign if that color is in play and not the player's own color
                    String colorStr = obj.name().replace("DESTROY_", "");
                    PlayerColor color = PlayerColor.valueOf(colorStr);
                    if (colorsInPlay.contains(color) && player.getColor() != color) {
                        assigned = obj;
                        it.remove();
                        break;
                    }
                } else {
                    assigned = obj;
                    it.remove();
                    break;
                }
            }
            // If no valid destroy objective, fallback to CONQUER_30_COUNTRIES
            if (assigned == null) {
                assigned = Objective.CONQUER_30_COUNTRIES;
            }
            player.setObjective(assigned);
        }
        // 3. Set game status
        game.setStatus(GameStatus.IN_PROGRESS);
        gameRepository.save(game);

        messagingTemplate.convertAndSend(
            "/topic/game-updates",
            Map.of(
                "type", "GAME_STARTED",
                "payload", GameDtoMapper.toGameDTO(game)
            )
        );
        return game;
    }
} 