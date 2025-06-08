package api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(exclude = {"playerCountries", "game", "user"})
@EqualsAndHashCode(exclude = {"playerCountries", "game", "user"})
@Entity
@Table(name = "game_players")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamePlayer {
    @EmbeddedId
    private GamePlayerId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("gameId")
    @JoinColumn(name = "game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "color", nullable = false)
    private PlayerColor color;

    @Column(name = "turn_order", nullable = false)
    private Integer turnOrder;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "objective")
    private Objective objective;

    @OneToMany(mappedBy = "gamePlayer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PlayerCountry> playerCountries = new HashSet<>();

    public Set<Country> getCountries() {
        Set<Country> countries = new HashSet<>();
        for (PlayerCountry pc : playerCountries) {
            countries.add(pc.getCountry());
        }
        return countries;
    }
} 