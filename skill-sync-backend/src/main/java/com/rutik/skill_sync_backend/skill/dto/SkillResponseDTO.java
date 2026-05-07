package com.rutik.skill_sync_backend.skill.dto;

import com.rutik.skill_sync_backend.skill.enums.SkillCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SkillResponseDTO {

    private Long id;
    private String name;
    private SkillCategory category;
}
