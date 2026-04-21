package com.rutik.skill_sync_backend.skill.service;


import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.enums.SkillType;

import java.util.List;

public interface SkillService {

    void addSkill(Long userId, UserSkillRequestDTO request);

    void removeSkill(Long userId, Long skillId, SkillType type);

    List<UserSkillResponseDTO> getUserSkills(Long userId);

    List<UserSkillResponseDTO> getUserSkillsByType(Long userId, SkillType type);
}