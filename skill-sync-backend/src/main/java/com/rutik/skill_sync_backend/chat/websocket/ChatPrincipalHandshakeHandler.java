package com.rutik.skill_sync_backend.chat.websocket;

import com.rutik.skill_sync_backend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Custom Handshake Handler mapping authenticated chat users to STOMP principals.
 * This assigns the user ID string as the Principal name, which allows target delivery
 * through SimpMessagingTemplate.convertAndSendToUser(userIdString, destination, payload).
 */
@Component
@Slf4j
public class ChatPrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        User user = (User) attributes.get("ws_chat_user");
        if (user != null) {
            String principalName = user.getId().toString();
            log.info("👤 Chat WebSocket session mapped to principal name (userId): {}", principalName);

            // Extract the user's role into a GrantedAuthority (prefixed with ROLE_)
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

            // Return UsernamePasswordAuthenticationToken which satisfies both java.security.Principal and Spring Security
            return new UsernamePasswordAuthenticationToken(principalName, null, authorities);
        }

        log.warn("⚠️ No user found in session attributes, Chat WebSocket session will remain anonymous");
        return null;
    }
}
