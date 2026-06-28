package com.rutik.skill_sync_backend.notification.config;

import com.rutik.skill_sync_backend.auth.service.JwtService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Handshake interceptor for WebSocket connections.
 * Extracts JWT from query param `?token=...`, validates it,
 * and sets the authenticated user in the session attributes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");

            if (token == null || token.isBlank()) {
                log.warn("❌ WebSocket Handshake blocked: Missing 'token' query parameter");
                return false;
            }

            try {
                Long userId = jwtService.extractUserId(token);
                if (userId == null) {
                    log.warn("❌ WebSocket Handshake blocked: Token does not contain userId");
                    return false;
                }

                User user = userRepository.findByIdAndIsActiveTrue(userId).orElse(null);
                if (user == null) {
                    log.warn("❌ WebSocket Handshake blocked: User {} not found or inactive", userId);
                    return false;
                }

                if (!jwtService.isValid(token, user)) {
                    log.warn("❌ WebSocket Handshake blocked: Invalid token for user {}", userId);
                    return false;
                }

                // Authentication succeeded. Save user in socket session attributes
                attributes.put("ws_user", user);
                log.info("✅ WebSocket Handshake authenticated successfully for user: {}", user.getEmail());
                return true;

            } catch (Exception ex) {
                log.error("❌ WebSocket Handshake error validating token: {}", ex.getMessage());
                return false;
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No post-handshake logic required
    }
}
