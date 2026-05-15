package com.rutik.skill_sync_backend.skill.dto;

import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ExploreSkillResponseDto {

    // ==========================================
    // USER SKILL ID
    // ==========================================

    private Long userSkillId;

    // ==========================================
    // SKILL INFO
    // ==========================================

    private String skillName;

    private SkillLevel skillLevel;

    private String category;

    private Long skillId;

    private Boolean isVerified;

    // ==========================================
    // USER INFO
    // ==========================================

    private Long userId;

    private String fullName;

    private String profilePicture;

    // ==========================================
    // TRUST SIGNALS
    // ==========================================

    private Double rating;

    private Integer completedSessions;

    // ==========================================
    // EXCHANGE CONTEXT
    // ==========================================

    private List<String> wantsToLearn;

    // ==========================================
    // PROVIDER AVAILABILITY
    // ==========================================

    private List<AvailabilityResponseDTO> availability;
}