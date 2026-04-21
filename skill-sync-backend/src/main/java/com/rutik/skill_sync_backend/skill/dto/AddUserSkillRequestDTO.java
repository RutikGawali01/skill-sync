package com.rutik.skill_sync_backend.skill.dto;

import lombok.Data;

@Data
public class AddUserSkillRequestDTO {
    private Long skillId;
    private String type;
    private String level;
}