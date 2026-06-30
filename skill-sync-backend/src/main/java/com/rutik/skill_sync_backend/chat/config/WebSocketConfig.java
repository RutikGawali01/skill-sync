package com.rutik.skill_sync_backend.chat.config;

import com.rutik.skill_sync_backend.chat.websocket.ChatHandshakeInterceptor;
import com.rutik.skill_sync_backend.chat.websocket.ChatPrincipalHandshakeHandler;
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
 * WebSocket and STOMP message broker configuration for the Chat Module.
 * Configures communication endpoints, client-side destinations, security filters,
 * and connection parameters (heartbeats/scheduling).
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatHandshakeInterceptor chatHandshakeInterceptor;
    private final ChatPrincipalHandshakeHandler chatPrincipalHandshakeHandler;

    @Value("${app.websocket.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    /**
     * Configures the message broker options:
     * 1. Enables a simple in-memory broker to broadcast topics (/topic) and send to specific queues (/queue).
     * 2. Sets client-to-server destination prefix (/app).
     * 3. Sets user-specific destination prefix (/user).
     * 4. Establishes a heartbeat frequency (25s ping, 25s pong) to maintain active connections and clean up dead ones.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable Simple Message Broker for point-to-point and pub/sub routing
        registry.enableSimpleBroker("/queue", "/topic")
                .setHeartbeatValue(new long[]{25000, 25000}) // 25 seconds ping/pong
                .setTaskScheduler(chatHeartbeatScheduler());

        // Prefix for routing client messages to controller handlers (e.g., @MessageMapping("/chat/send"))
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix for targeting individual user queue subscriptions (e.g., /user/queue/chat/messages)
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Registers the STOMP connection endpoints:
     * 1. Registers /chat-ws for standard WebSocket connections.
     * 2. Registers /chat-ws with SockJS fallback for compatibility with older clients or proxy configurations.
     * 3. Adds JWT token handshake interceptor and principal handshake handler to identify/authenticate users.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Standard WebSocket connection endpoint
        registry.addEndpoint("/chat-ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .addInterceptors(chatHandshakeInterceptor)
                .setHandshakeHandler(chatPrincipalHandshakeHandler);

        // SockJS fallback connection endpoint
        registry.addEndpoint("/chat-ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .addInterceptors(chatHandshakeInterceptor)
                .setHandshakeHandler(chatPrincipalHandshakeHandler)
                .withSockJS();
    }

    /**
     * Dedicated task scheduler for sending and receiving heartbeats.
     * Prevents blocking of default worker threads.
     */
    @Bean
    public TaskScheduler chatHeartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("chat-ws-heartbeat-thread-");
        scheduler.initialize();
        return scheduler;
    }
}
