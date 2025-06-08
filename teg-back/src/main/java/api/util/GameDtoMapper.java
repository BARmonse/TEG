package api.util;

import api.dto.GameDTO;
import api.dto.GamePlayerDTO;
import api.dto.UserDTO;
import api.model.Country;
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
        GamePlayerDTO dto = new GamePlayerDTO();
        dto.setId(gp.getUser().getId());
        dto.setUser(toUserDTO(gp.getUser()));
        dto.setColor(gp.getColor().name());
        dto.setTurnOrder(gp.getTurnOrder());
        dto.setJoinedAt(gp.getJoinedAt());
        dto.setObjective(gp.getObjective() != null ? gp.getObjective().name() : null);
        dto.setCountries(gp.getCountries() != null ? gp.getCountries().stream().map(Country::getId).toList() : List.of());
        return dto;
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