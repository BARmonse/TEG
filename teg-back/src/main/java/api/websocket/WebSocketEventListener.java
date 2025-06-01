package api.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final WebSocketHandler webSocketHandler;
    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.debug("WebSocket SessionConnectedEvent received: {}", event);
        webSocketHandler.handleConnect(event.getMessage().getHeaders());
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        log.debug("WebSocket SessionDisconnectEvent received: {}", event);
        webSocketHandler.handleDisconnect(event.getMessage().getHeaders());
    }

    @EventListener
    public void handleWebSocketConnect(SessionConnectEvent event) {
        log.debug("WebSocket SessionConnectEvent received: {}", event);
    }
} 