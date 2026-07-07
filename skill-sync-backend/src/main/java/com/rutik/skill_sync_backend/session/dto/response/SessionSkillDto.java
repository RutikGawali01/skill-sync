package com.rutik.skill_sync_backend.session.dto.response;

import com.rutik.skill_sync_backend.skill.enums.SkillCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
//why -- Future frontend cards become cleaner.
public class SessionSkillDto {

    private Long id;

    private String name;

    private SkillCategory category;
}