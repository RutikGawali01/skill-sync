package com.rutik.skill_sync_backend.auth.service;

import com.rutik.skill_sync_backend.auth.entity.RefreshToken;
import com.rutik.skill_sync_backend.auth.repository.RefreshTokenRepository;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repo;

    @Override
    public RefreshToken createToken(User user) {

        repo.deleteByUser(user); // single session

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        return repo.save(token);
    }

    @Override
    public RefreshToken verify(String token) {

        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (rt.isRevoked() || rt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        return rt;
    }

    @Override
    @Transactional
    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repo.save(token);
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(User user) {
        repo.revokeAllByUser(user);
    }

    @Override
    public void revokeByToken(String token) {
        RefreshToken rt = verify(token);
        revoke(rt);
    }
}