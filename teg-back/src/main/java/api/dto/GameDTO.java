package api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
    private Long id;
    private String name;
    private Integer maxPlayers;
    private Integer currentPlayers;
    private String status;
    private LocalDateTime createdAt;
    private List<String> playerUsernames;
    private String creatorUsername;
}