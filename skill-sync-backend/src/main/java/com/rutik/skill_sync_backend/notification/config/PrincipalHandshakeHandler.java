package com.rutik.skill_sync_backend.notification.config;

import com.rutik.skill_sync_backend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/**
 * Custom Handshake Handler mapping authenticated users to STOMP principals.
 * This assigns the user ID string as the Principal name, which allows target delivery
 * through SimpMessagingTemplate.convertAndSendToUser(userIdString, destination, payload).
 */
@Component
@Slf4j
public class PrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        
        User user = (User) attributes.get("ws_user");
        if (user != null) {
            String principalName = user.getId().toString();
            log.info("👤 WebSocket session mapped to StompPrincipal name (userId): {}", principalName);
            return new StompPrincipal(principalName);
        }

        log.warn("⚠️ No user found in session attributes, WebSocket session will remain anonymous");
        return null;
    }

    /**
     * Simple implementation of java.security.Principal to represent a STOMP user.
     */
    private static class StompPrincipal implements Principal {
        private final String name;

        public StompPrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }
    }
}
