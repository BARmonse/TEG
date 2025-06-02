package api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString(exclude = {"game", "user"})
@EqualsAndHashCode(exclude = {"game", "user"})
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
} 