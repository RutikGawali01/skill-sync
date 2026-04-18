package com.rutik.skill_sync_backend.auth.service;

import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;
import com.rutik.skill_sync_backend.auth.dto.LoginRequest;
import com.rutik.skill_sync_backend.auth.dto.RegisterRequest;
import com.rutik.skill_sync_backend.auth.entity.RefreshToken;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ForbiddenException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.enums.Role;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshService;
    private final AuthenticationManager authManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .experienceLevel(request.getExperienceLevel())
                .bio(request.getBio())
                .role(Role.USER)
                .tokenVersion(0)
                .isActive(true)
                .isVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(String token) {

        RefreshToken oldToken = refreshService.verify(token);

        if (oldToken.isRevoked()) {
            refreshService.revokeAllUserTokens(oldToken.getUser());
            throw new UnauthorizedException("Token reuse detected");
        }

        refreshService.revoke(oldToken);

        return generateAuthResponse(oldToken.getUser());
    }

    @Override
    @Transactional
    public void logout(String token) {
        refreshService.revokeByToken(token);
    }

    // 🔥 common method
    private AuthResponse generateAuthResponse(User user) {

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }
}