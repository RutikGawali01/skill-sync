package com.rutik.skill_sync_backend.notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Main WebSocket and STOMP message broker configuration.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final PrincipalHandshakeHandler principalHandshakeHandler;

    @Value("${app.websocket.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple broker for queue (point-to-point) and topic (pub/sub if needed)
        registry.enableSimpleBroker("/queue", "/topic")
                .setHeartbeatValue(new long[]{25000, 25000}) // 25s ping/pong
                .setTaskScheduler(heartbeatScheduler());

        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Standard WebSocket connection endpoint
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins) // Secure origin config loaded from application variables
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(principalHandshakeHandler);

        // SockJS fallback connection endpoint
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins)
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(principalHandshakeHandler)
                .withSockJS();
    }

    /**
     * Dedicated task scheduler for sending and receiving heartbeats.
     * Prevents blocking of default worker threads.
     */
    @Bean
    public TaskScheduler heartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-thread-");
        scheduler.initialize();
        return scheduler;
    }
}
