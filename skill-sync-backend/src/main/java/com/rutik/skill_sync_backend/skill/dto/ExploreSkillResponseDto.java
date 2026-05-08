package com.rutik.skill_sync_backend.skill.dto;

import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ExploreSkillResponseDto {

    private Long userSkillId;

    // Skill Info
    private String skillName;
    private SkillLevel skillLevel;
    private String category;

    // User Info
    private Long userId;
    private String fullName;
    private String profilePicture;
    private Double rating;
    private Integer completedSessions;

    // Exchange Info
    private List<String> wantsToLearn;
}