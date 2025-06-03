package api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LobbyEvent {
    private LobbyEventType type;
    private String username;
    private Long gameId;
    private String message;

    public enum LobbyEventType {
        USER_JOINED,
        USER_LEFT,
        GAME_STARTED,
        GAME_CANCELLED,
        ERROR
    }
} 