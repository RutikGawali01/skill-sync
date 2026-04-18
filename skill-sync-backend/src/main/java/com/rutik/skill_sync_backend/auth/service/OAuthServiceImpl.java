package com.rutik.skill_sync_backend.auth.service;

import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;
import com.rutik.skill_sync_backend.auth.entity.RefreshToken;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.enums.Role;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public AuthResponse handleGoogleLogin(GoogleAuthRequest request) {

        // 🔥 In real production → verify Google ID token (skip for now)

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(request.getEmail())
                            .name(request.getName())
                            .role(Role.USER)
                            .isVerified(true) // ✅ Google verified
                            .isActive(true)
                            .tokenVersion(0)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(newUser);
                });

        // increment token version (new session)
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }
}