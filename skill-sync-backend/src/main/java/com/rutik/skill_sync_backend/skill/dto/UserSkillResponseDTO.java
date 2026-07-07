package com.rutik.skill_sync_backend.skill.dto;

import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillResponseDTO {

    private Long id;
    private Long skillId;
    private String skillName;
    private SkillType type;
    private SkillLevel level;

    private Boolean isVerified;

    private Double verificationScore;

    private LocalDateTime verifiedAt;

    private Integer verificationAttempts;

    private LocalDateTime retryAvailableAt;

    private VerificationStatus verificationStatus;

}