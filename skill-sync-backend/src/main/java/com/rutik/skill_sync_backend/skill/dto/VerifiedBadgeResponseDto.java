package com.rutik.skill_sync_backend.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedBadgeResponseDto {

    private Long skillId;

    private String skillName;

    private Double verificationScore;

    private LocalDateTime verifiedAt;
}
