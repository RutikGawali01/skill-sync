package com.rutik.skill_sync_backend.auth.service;

import com.rutik.skill_sync_backend.auth.entity.RefreshToken;
import com.rutik.skill_sync_backend.user.entity.User;

public interface RefreshTokenService {

    RefreshToken createToken(User user);

    RefreshToken verify(String token);

    void revoke(RefreshToken token);

    void revokeAllUserTokens(User user);

    void revokeByToken(String token);
}