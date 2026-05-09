package com.rutik.skill_sync_backend.skill.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VerifiedBadgeResponseDto {

    private Long skillId;

    private String skillName;

    private Double verificationScore;

    private LocalDateTime verifiedAt;
}
