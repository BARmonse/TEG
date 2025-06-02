package api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGameRequest {
    @NotBlank(message = "Game name is required")
    private String gameName;

    @NotNull(message = "Maximum players is required")
    @Min(value = 2, message = "Minimum players is 2")
    @Max(value = 6, message = "Maximum players is 6")
    private Integer maxPlayers;
} 