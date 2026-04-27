package com.rutik.skill_sync_backend.auth.filter;


import com.rutik.skill_sync_backend.auth.service.JwtService;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

//        log.info("🔐 JWT Filter triggered for: {}", request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        // 🔹 No token → skip
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            log.warn("❌ No Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
//            log.info("✅ Token extracted");

            Long userId = jwtService.extractUserId(token);
//            log.info("👤 Extracted userId: {}", userId);

            if (userId != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository.findByIdAndIsActiveTrue(userId)
                        .orElseThrow(() -> {
//                            log.error("❌ User not found or inactive for ID: {}", userId);
                            return new UnauthorizedException("User not found");
                        });

//                log.info("✅ User found: {}", user.getEmail());

                if (jwtService.isValid(token, user)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);

//                    log.info("✅ Authentication SUCCESS for userId: {}", userId);
                } else {
//                    log.error("❌ Token validation FAILED");
                }
            }

        } catch (Exception ex) {
//            log.error("❌ JWT Exception: {}", ex.getMessage(), ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}