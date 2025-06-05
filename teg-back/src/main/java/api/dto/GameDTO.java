package api.dto;

import api.model.GamePlayer;
import api.model.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
    private Long id;
    private String name;
    private Integer maxPlayers;
    private String status;
    private LocalDateTime createdAt;
    private UserDTO createdBy;
    private List<GamePlayerDTO> players;
}