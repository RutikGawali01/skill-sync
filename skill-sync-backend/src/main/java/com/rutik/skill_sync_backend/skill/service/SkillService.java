package com.rutik.skill_sync_backend.skill.service;


import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;

import java.util.List;

public interface SkillService {

    void addSkill(AddSkillRequestDTO request);

    void addUserSkill(Long userId, AddUserSkillRequestDTO request);

    List<UserSkillResponseDTO> getUserSkills(Long userId);
}