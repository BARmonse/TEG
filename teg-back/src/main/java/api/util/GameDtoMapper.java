package api.util;

import api.dto.GameDTO;
import api.dto.GamePlayerDTO;
import api.dto.UserDTO;
import api.model.Game;
import api.model.GamePlayer;
import api.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class GameDtoMapper {
    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail()
        );
    }

    public static GamePlayerDTO toGamePlayerDTO(GamePlayer gp) {
        if (gp == null) return null;
        return new GamePlayerDTO(
            gp.getId() != null ? gp.getId().getUserId() : null, // or another unique identifier
            toUserDTO(gp.getUser()),
            gp.getColor() != null ? gp.getColor().toString() : null,
            gp.getTurnOrder(),
            gp.getJoinedAt()
        );
    }

    public static GameDTO toGameDTO(Game game) {
        if (game == null) return null;
        List<GamePlayerDTO> playerDTOs = game.getPlayers().stream()
            .map(GameDtoMapper::toGamePlayerDTO)
            .collect(Collectors.toList());
        return new GameDTO(
            game.getId(),
            game.getName(),
            game.getMaxPlayers(),
            game.getStatus() != null ? game.getStatus().toString() : null,
            game.getCreatedAt(),
            toUserDTO(game.getCreatedBy()),
            playerDTOs
        );
    }
} 