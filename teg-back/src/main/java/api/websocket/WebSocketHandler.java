package api.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
@Slf4j
public class WebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicInteger activeUsers = new AtomicInteger(0);
    private final ConcurrentHashMap<String, String> sessionUsers = new ConcurrentHashMap<>();

    public WebSocketHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleConnect(MessageHeaders headers) {
        log.debug("Handling connect with headers: {}", headers);
        String sessionId = extractSessionId(headers);
        log.debug("Session ID from headers: {}", sessionId);
        
        if (sessionId != null && !sessionUsers.containsKey(sessionId)) {
            sessionUsers.put(sessionId, sessionId);
            int count = activeUsers.incrementAndGet();
            log.info("User connected with session {}. Active users: {}, Current sessions: {}", 
                    sessionId, count, sessionUsers.keySet());
            
            // First send to the specific user
            sendActiveUsersCount(sessionId);
            // Then broadcast to all
            broadcastActiveUsersCount();
        } else {
            log.warn("Connection attempt with invalid session ID or duplicate session. SessionId: {}, Existing sessions: {}", 
                    sessionId, sessionUsers.keySet());
        }
    }

    public void handleDisconnect(MessageHeaders headers) {
        log.debug("Handling disconnect with headers: {}", headers);
        String sessionId = extractSessionId(headers);
        log.debug("Session ID from headers: {}", sessionId);
        
        if (sessionId != null && sessionUsers.remove(sessionId) != null) {
            int count = activeUsers.decrementAndGet();
            log.info("User disconnected with session {}. Active users: {}, Remaining sessions: {}", 
                    sessionId, count, sessionUsers.keySet());
            broadcastActiveUsersCount();
        } else {
            log.warn("Disconnect attempt with invalid session ID. SessionId: {}, Existing sessions: {}", 
                    sessionId, sessionUsers.keySet());
        }
    }

    private String extractSessionId(MessageHeaders headers) {
        String sessionId = (String) headers.get("simpSessionId");
        if (sessionId == null) {
            // Try to get it from the accessor if present
            SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap((Message<?>) headers);
            sessionId = accessor.getSessionId();
        }
        return sessionId;
    }

    @MessageMapping("/get-active-users")
    @SendTo("/topic/active-users")
    public ActiveUsersMessage getActiveUsers() {
        int count = activeUsers.get();
        log.debug("Received request for active users count. Current count: {}", count);
        return new ActiveUsersMessage(count);
    }

    private void broadcastActiveUsersCount() {
        int count = activeUsers.get();
        log.info("Broadcasting active users count: {}", count);
        try {
            messagingTemplate.convertAndSend("/topic/active-users", new ActiveUsersMessage(count));
            log.debug("Successfully broadcast active users count");
        } catch (Exception e) {
            log.error("Error broadcasting active users count", e);
        }
    }

    private void sendActiveUsersCount(String sessionId) {
        int count = activeUsers.get();
        log.info("Sending active users count to session {}: {}", sessionId, count);
        try {
            messagingTemplate.convertAndSendToUser(
                sessionId,
                "/queue/active-users",
                new ActiveUsersMessage(count)
            );
            log.debug("Successfully sent active users count to session {}", sessionId);
        } catch (Exception e) {
            log.error("Error sending active users count to session {}", sessionId, e);
        }
    }

    private record ActiveUsersMessage(int count) {}
} 