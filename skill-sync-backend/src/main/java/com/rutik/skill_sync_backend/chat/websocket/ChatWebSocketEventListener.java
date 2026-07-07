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


@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketEventListener {

    private final PresenceService presenceService;


    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            String userIdStr = principal.getName();
            log.info(" Chat STOMP CONNECT event received. User ID: {}", userIdStr);
            try {
                Long userId = Long.valueOf(userIdStr);
                presenceService.handleUserConnect(userId);
            } catch (NumberFormatException e) {
                log.error("Failed to parse userId from principal name: {}", userIdStr, e);
            }
        } else {
            log.warn("Chat STOMP CONNECT event received from anonymous session");
        }
    }


    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            String userIdStr = principal.getName();
            log.info(" Chat STOMP DISCONNECT event received. User ID: {}", userIdStr);
            try {
                Long userId = Long.valueOf(userIdStr);
                presenceService.handleUserDisconnect(userId);
            } catch (NumberFormatException e) {
                log.error("Failed to parse userId from principal name: {}", userIdStr, e);
            }
        } else {
            log.warn(" Chat STOMP DISCONNECT event received from anonymous session");
        }
    }
}
