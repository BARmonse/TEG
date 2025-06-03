package api.controller;


import api.service.LobbyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LobbyController {
    private final LobbyService lobbyService;

    @MessageMapping("/game/{gameId}/join")
    public void joinGame(@DestinationVariable Long gameId, Principal principal) {
        try {
            lobbyService.joinGame(gameId, principal.getName());
        } catch (Exception e) {
            log.error("Error joining game: {}", e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/game/{gameId}/leave")
    public void leaveGame(@DestinationVariable Long gameId, Principal principal) {
        try {
            lobbyService.leaveGame(gameId, principal.getName());
        } catch (Exception e) {
            log.error("Error leaving game: {}", e.getMessage());
            throw e;
        }
    }

    @MessageMapping("/game/{gameId}/start")
    public void startGame(@DestinationVariable Long gameId, Principal principal) {
        try {
            lobbyService.startGame(gameId, principal.getName());
        } catch (Exception e) {
            log.error("Error starting game: {}", e.getMessage());
            throw e;
        }
    }
} 