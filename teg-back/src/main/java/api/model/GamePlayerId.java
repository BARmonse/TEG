package api.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class GamePlayerId implements Serializable {
    private Long gameId;
    private Long userId;
} 