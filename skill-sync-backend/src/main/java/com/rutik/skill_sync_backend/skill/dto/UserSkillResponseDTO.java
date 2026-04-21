package com.rutik.skill_sync_backend.skill.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSkillResponseDTO {

    private String skillName;
    private String type;
    private String level;
}