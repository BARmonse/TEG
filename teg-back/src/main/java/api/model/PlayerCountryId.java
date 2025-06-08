package api.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class PlayerCountryId implements Serializable {
    private Long gameId;
    private Long userId;
    private String countryId;
}
