package com.rutik.skill_sync_backend.auth.service;


import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;

public interface OAuthService {
    AuthResponse handleGoogleLogin(GoogleAuthRequest request);
}