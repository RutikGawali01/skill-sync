package com.rutik.skill_sync_backend.skill.service;


import com.rutik.skill_sync_backend.skill.dto.*;
import com.rutik.skill_sync_backend.skill.enums.SkillType;

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

    List<ExploreSkillResponseDto> getExploreSkills();
}