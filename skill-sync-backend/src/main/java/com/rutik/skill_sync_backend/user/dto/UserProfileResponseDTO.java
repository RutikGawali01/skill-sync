package com.rutik.skill_sync_backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
public class UserProfileResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String profilePicUrl;
}