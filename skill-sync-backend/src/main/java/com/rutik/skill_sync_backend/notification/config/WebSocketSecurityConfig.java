package com.rutik.skill_sync_backend.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;

/**
 * WebSocket Security Configuration for Spring Security 6.
 *
 * Configures:
 * ─────────────────
 * 1. `@EnableWebSocketSecurity` to secure inbound messaging channels.
 * 2. Disables the STOMP-level CSRF check (csrfChannelInterceptor) because:
 *    - HTTP-level CSRF is already disabled in SecurityConfig for our stateless JWT API.
 *    - The WebSocket handshake is authenticated via JwtHandshakeInterceptor (query param token).
 *    - The Spring Security 6 `@EnableWebSocketSecurity` adds a CsrfChannelInterceptor that
 *      independently requires a CSRF token in STOMP headers — this caused
 *      "Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]"
 *      because no CSRF token was sent from the SockJS/STOMP client.
 * 3. Permits low-level STOMP lifecycle events (CONNECT, DISCONNECT, heartbeats).
 * 4. Restricts subscription destinations to authenticated users only.
 * 5. Denies all outbound publishing from clients (notifications are strictly system-generated).
 */
@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    /**
     * Overrides Spring Security 6's default CsrfChannelInterceptor with a no-op.
     *
     * Without this override, @EnableWebSocketSecurity registers a CsrfChannelInterceptor
     * that blocks every STOMP CONNECT frame unless the client sends a CSRF token in the
     * message headers. Our SockJS client does not (and cannot easily) send CSRF tokens —
     * authentication is handled at the HTTP handshake level via JWT query param.
     *
     * Bean name "csrfChannelInterceptor" matches the name registered by
     * WebSocketMessageBrokerSecurityConfiguration, so Spring replaces it with this no-op.
     */
    @Bean("csrfChannelInterceptor")
    public ChannelInterceptor csrfChannelInterceptor() {
        // No-op: CSRF for WebSocket is intentionally disabled.
        // Security is enforced by JwtHandshakeInterceptor during the HTTP upgrade.
        return new ChannelInterceptor() {};
    }

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager(MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        messages
                // Permit connection-level lifecycle events
                .simpTypeMatchers(
                        org.springframework.messaging.simp.SimpMessageType.CONNECT,
                        org.springframework.messaging.simp.SimpMessageType.DISCONNECT,
                        org.springframework.messaging.simp.SimpMessageType.OTHER
                ).permitAll()

                // Secure user queue subscriptions — principal set by PrincipalHandshakeHandler
                .simpSubscribeDestMatchers(
                        "/user/queue/notifications",
                        "/user/queue/notifications/count",
                        "/user/queue/chat/**"
                ).authenticated()

                // Permit inbound chat publishing destinations
                .simpDestMatchers(
                        "/app/chat/**"
                ).authenticated()

                // Deny any client publishing or arbitrary subscriptions
                .anyMessage().denyAll();

        return messages.build();
    }
}
