package com.rutik.skill_sync_backend.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

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
                        org.springframework.messaging.simp.SimpMessageType.UNSUBSCRIBE,
                        org.springframework.messaging.simp.SimpMessageType.HEARTBEAT,
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
