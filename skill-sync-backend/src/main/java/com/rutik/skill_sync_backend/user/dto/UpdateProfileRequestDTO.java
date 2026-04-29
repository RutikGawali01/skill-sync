package com.rutik.skill_sync_backend.user.dto;

import com.rutik.skill_sync_backend.user.enums.*;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProfileRequestDTO {
    @Size(max = 1000)
    private String bio;

    private String profilePicUrl;
    private String name;

    private String location;
    private String timezone;

    private LearningGoal learningGoal;
    private GoalTimeline goalTimeline;
    private TeachingMotivation teachingMotivation;
    private List<TeachingApproach> teachingApproaches;
    private LearningMethod preferredLearningMethod;
    private CommunicationPace communicationPace;
    private String preferredLanguage;
    private DomainFocus domainFocus;

    private Integer hoursPerWeek;
}