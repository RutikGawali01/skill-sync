package com.rutik.skill_sync_backend.auth.filter;

import com.rutik.skill_sync_backend.auth.service.JwtService;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 🔹 No token → skip
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);

            Long userId = jwtService.extractUserId(token);

            if (userId != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository.findByIdAndIsActiveTrue(userId)
                        .orElseThrow(() -> new UnauthorizedException("User not found or inactive"));

                if (jwtService.isValid(token, user)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    List.of(new SimpleGrantedAuthority(user.getRole().name()))
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (Exception ex) {
            // 🔥 Do NOT break request → let global handler manage
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}