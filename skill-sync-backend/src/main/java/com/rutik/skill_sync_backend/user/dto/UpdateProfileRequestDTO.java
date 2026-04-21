package com.rutik.skill_sync_backend.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    private String name;
    @Size(max = 1000)
    private String bio;

    private String profilePicUrl;
}