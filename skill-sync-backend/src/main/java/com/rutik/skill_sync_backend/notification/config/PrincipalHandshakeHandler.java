package com.rutik.skill_sync_backend.notification.config;

import com.rutik.skill_sync_backend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import java.util.List;

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
            log.info("👤 WebSocket session mapped to principal name (userId): {}", principalName);
            
            // Extract the user's role into a GrantedAuthority
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            
            // IMPORTANT: Spring Security 6 .authenticated() requires an actual Authentication object,
            // not just a simple java.security.Principal. UsernamePasswordAuthenticationToken satisfies both.
            return new UsernamePasswordAuthenticationToken(principalName, null, authorities);
        }

        log.warn("⚠️ No user found in session attributes, WebSocket session will remain anonymous");
        return null;
    }
}
