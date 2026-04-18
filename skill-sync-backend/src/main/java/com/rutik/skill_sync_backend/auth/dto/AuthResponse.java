package com.rutik.skill_sync_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    private String refreshToken; // optional to return (cookie already set)
}