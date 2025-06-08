package api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_countries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PlayerCountry {
    @EmbeddedId
    private PlayerCountryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumns({
            @JoinColumn(name = "game_id", referencedColumnName = "game_id"),
            @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    })
    private GamePlayer gamePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("countryId")
    @JoinColumn(name = "country_id", referencedColumnName = "id")
    private Country country;
}