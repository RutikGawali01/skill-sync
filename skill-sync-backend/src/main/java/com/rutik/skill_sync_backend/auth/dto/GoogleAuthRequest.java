package com.rutik.skill_sync_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class GoogleAuthRequest {

    @NotBlank
    private String idToken; // 🔥 FIXED (not email/name)
}