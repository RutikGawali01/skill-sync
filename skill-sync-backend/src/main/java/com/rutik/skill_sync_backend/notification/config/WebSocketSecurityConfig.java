package com.rutik.skill_sync_backend.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;

/**
 * WebSocket Security Configuration for Spring Security 6.
 *
 * Configures:
 * ─────────────────
 * 1. `@EnableWebSocketSecurity` to secure inbound messaging channels.
 * 2. Permits low-level STOMP lifecycle events (CONNECT, DISCONNECT, heartbeats).
 * 3. Restricts subscription destinations `/user/queue/notifications` and `/user/queue/notifications/count`
 *    strictly to authenticated users.
 * 4. Denies all outbound publishing from clients (notifications are strictly system-generated).
 */
@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager(MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        messages
                // Permit connection-level lifecycle events
                .simpTypeMatchers(
                        org.springframework.messaging.simp.SimpMessageType.CONNECT,
                        org.springframework.messaging.simp.SimpMessageType.DISCONNECT,
                        org.springframework.messaging.simp.SimpMessageType.OTHER
                ).permitAll()
                
                // Secure user queue subscriptions
                .simpSubscribeDestMatchers(
                        "/user/queue/notifications",
                        "/user/queue/notifications/count"
                ).authenticated()
                
                // Deny any client publishing or arbitrary subscriptions
                .anyMessage().denyAll();

        return messages.build();
    }
}
