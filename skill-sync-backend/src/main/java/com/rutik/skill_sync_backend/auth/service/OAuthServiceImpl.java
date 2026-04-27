package com.rutik.skill_sync_backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;
import com.rutik.skill_sync_backend.auth.entity.RefreshToken;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.enums.AuthProvider;
import com.rutik.skill_sync_backend.user.enums.Role;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleTokenVerifier googleTokenVerifier; // ✅ FIXED

    @Override
    public AuthResponse handleGoogleLogin(GoogleAuthRequest request) {

        // ✅ VERIFY TOKEN
        GoogleIdToken.Payload payload =
                googleTokenVerifier.verify(request.getIdToken());

        String email = payload.getEmail();
        String name = (String) payload.getOrDefault("name", "User");

        // ✅ CHECK EMAIL VERIFIED
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new RuntimeException("Email not verified by Google");
        }

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {

                    // ✅ PROVIDER CHECK
                    if (existingUser.getProvider() != AuthProvider.GOOGLE) {
                        throw new RuntimeException("Please login using email/password");
                    }

                    return existingUser;
                })
                .orElseGet(() -> {
                    // ✅ CREATE NEW USER
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .role(Role.USER)
                            .provider(AuthProvider.GOOGLE)
                            .isVerified(true)
                            .isActive(true)
                            .tokenVersion(0)
                            .build();

                    return userRepository.save(newUser);
                });

        // 🔥 NEW SESSION (invalidate old tokens)
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }
}