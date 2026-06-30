package com.rutik.skill_sync_backend.chat.websocket;

import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

/**
 * WebSocket event listener to log connection state changes
 * and update user online presence status inside PresenceService.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketEventListener {

    private final PresenceService presenceService;

    /**
     * Event listener to capture successful STOMP connections.
     * Extracts user ID from user Principal and updates PresenceService.
     *
     * @param event the SessionConnectEvent
     */
    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            String userIdStr = principal.getName();
            log.info("📶 Chat STOMP CONNECT event received. User ID: {}", userIdStr);
            try {
                Long userId = Long.valueOf(userIdStr);
                presenceService.handleUserConnect(userId);
            } catch (NumberFormatException e) {
                log.error("Failed to parse userId from principal name: {}", userIdStr, e);
            }
        } else {
            log.warn("📶 Chat STOMP CONNECT event received from anonymous session");
        }
    }

    /**
     * Event listener to capture STOMP disconnections.
     * Extracts user ID from user Principal and updates PresenceService.
     *
     * @param event the SessionDisconnectEvent
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            String userIdStr = principal.getName();
            log.info("📴 Chat STOMP DISCONNECT event received. User ID: {}", userIdStr);
            try {
                Long userId = Long.valueOf(userIdStr);
                presenceService.handleUserDisconnect(userId);
            } catch (NumberFormatException e) {
                log.error("Failed to parse userId from principal name: {}", userIdStr, e);
            }
        } else {
            log.warn("📴 Chat STOMP DISCONNECT event received from anonymous session");
        }
    }
}
