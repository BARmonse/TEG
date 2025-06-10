package api.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCountryId implements Serializable {

    private GamePlayerId gamePlayerId;

    private String countryId;

    public PlayerCountryId(Long gameId, Long userId, String countryId) {
        this.gamePlayerId = new GamePlayerId(gameId, userId);
        this.countryId = countryId;
    }
}