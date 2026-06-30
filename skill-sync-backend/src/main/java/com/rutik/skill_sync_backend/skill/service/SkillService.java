package com.rutik.skill_sync_backend.skill.service;


import com.rutik.skill_sync_backend.skill.dto.*;
import com.rutik.skill_sync_backend.skill.enums.SkillType;

import com.rutik.skill_sync_backend.common.dto.PageResponse;

import java.util.List;

public interface SkillService {

    // ✅ User Skills
    UserSkillResponseDTO addSkill(Long userId, UserSkillRequestDTO request);

    void removeSkill(Long userId, Long skillId, SkillType type);

    List<UserSkillResponseDTO> getUserSkills(Long userId);

    List<UserSkillResponseDTO> getUserSkillsByType(
            Long userId,
            SkillType type
    );

    // ✅ Skill Catalog
    List<SkillResponseDTO> getAllSkills(String keyword);

    PageResponse<ExploreSkillResponseDto> getExploreSkills(
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    );

    List<VerifiedBadgeResponseDto> getVerifiedBadges(
            Long userId
    );
}