package com.rutik.skill_sync_backend.auth.service;

import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;
import com.rutik.skill_sync_backend.auth.dto.LoginRequest;
import com.rutik.skill_sync_backend.auth.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String token);

    void logout(String token);
}
