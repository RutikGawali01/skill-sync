package com.rutik.skill_sync_backend.skill.mapper;

import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.VerificationStatus;

import java.time.LocalDateTime;
public class UserSkillMapper {

    private UserSkillMapper() {
    }

    public static UserSkillResponseDTO mapToDto(
            UserSkill userSkill
    ) {

        return UserSkillResponseDTO.builder()

                // ==========================================
                // BASIC DETAILS
                // ==========================================

                .id(userSkill.getId())

                .skillId(
                        userSkill.getSkill().getId()
                )

                .skillName(
                        userSkill.getSkill().getName()
                )

                .type(userSkill.getType())

                .level(userSkill.getLevel())

                // ==========================================
                // VERIFICATION DETAILS
                // ==========================================

                .isVerified(
                        Boolean.TRUE.equals(
                                userSkill.getIsVerified()
                        )
                )

                .verificationScore(
                        userSkill.getVerificationScore()
                )

                .verifiedAt(
                        userSkill.getVerifiedAt()
                )

                .verificationAttempts(
                        userSkill.getVerificationAttempts()
                )

                .retryAvailableAt(
                        userSkill.getRetryAvailableAt()
                )

                .verificationStatus(
                        determineVerificationStatus(userSkill)
                )

                .build();
    }

    private static VerificationStatus determineVerificationStatus(
            UserSkill userSkill
    ) {

        // ==========================================
        // VERIFIED
        // ==========================================

        if (Boolean.TRUE.equals(
                userSkill.getIsVerified()
        )) {

            return VerificationStatus.VERIFIED;
        }

        // ==========================================
        // COOLDOWN
        // ==========================================

        if (userSkill.getRetryAvailableAt() != null
                && userSkill.getRetryAvailableAt()
                .isAfter(LocalDateTime.now())) {

            return VerificationStatus.COOLDOWN;
        }

        // ==========================================
        // DEFAULT
        // ==========================================

        return VerificationStatus.NOT_STARTED;
    }
}