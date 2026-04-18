package com.rutik.skill_sync_backend.auth.controller;

import com.rutik.skill_sync_backend.auth.dto.AuthResponse;
import com.rutik.skill_sync_backend.auth.dto.GoogleAuthRequest;
import com.rutik.skill_sync_backend.auth.dto.LoginRequest;
import com.rutik.skill_sync_backend.auth.dto.RegisterRequest;
import com.rutik.skill_sync_backend.auth.service.AuthService;
import com.rutik.skill_sync_backend.auth.service.OAuthService;
import com.rutik.skill_sync_backend.auth.util.CookieUtil;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final OAuthService oauthService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {

        AuthResponse auth = service.register(request);
        cookieUtil.add(response, auth.getRefreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("User registered successfully",
                        new AuthResponse(auth.getAccessToken(), null))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {

        AuthResponse auth = service.login(request);
        cookieUtil.add(response, auth.getRefreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("Login successful",
                        new AuthResponse(auth.getAccessToken(), null))
        );
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody GoogleAuthRequest request,
            HttpServletResponse response
    ) {

        AuthResponse auth = oauthService.handleGoogleLogin(request);
        cookieUtil.add(response, auth.getRefreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("Google login successful",
                        new AuthResponse(auth.getAccessToken(), null))
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String token = cookieUtil.extract(request);
        AuthResponse auth = service.refresh(token);

        cookieUtil.add(response, auth.getRefreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("Token refreshed",
                        new AuthResponse(auth.getAccessToken(), null))
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String token = cookieUtil.extract(request);
        service.logout(token);

        cookieUtil.clear(response);

        return ResponseEntity.ok(
                ApiResponse.success("Logged out successfully")
        );
    }
}