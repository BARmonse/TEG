package api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GamePlayerDTO {
    private Long id;
    private UserDTO user;
    private String color;
    private Integer turnOrder;
    private LocalDateTime joinedAt;
    private String objective;
    private List<String> countries;
} 