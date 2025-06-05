package api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GamePlayerDTO {
    private Long id;
    private UserDTO user;
    private String color;
    private Integer turnOrder;
    private LocalDateTime joinedAt;
} 