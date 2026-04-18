package com.rutik.skill_sync_backend.auth.dto;

import com.rutik.skill_sync_backend.user.enums.ExperienceLevel;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String bio;

    private ExperienceLevel experienceLevel;
}