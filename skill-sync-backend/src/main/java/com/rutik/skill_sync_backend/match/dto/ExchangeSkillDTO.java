package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeSkillDTO {
    private String skillName;
    private String direction; // "GIVE" or "TAKE"
    private String level; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
}
