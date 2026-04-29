package com.rutik.skill_sync_backend.user.dto;

import com.rutik.skill_sync_backend.user.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
public class UserProfileResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String profilePicUrl;

    private String location;
    private String timezone;

    // Matching
    private LearningGoal learningGoal;
    private GoalTimeline goalTimeline;
    private TeachingMotivation teachingMotivation;
    private List<TeachingApproach> teachingApproaches;
    private LearningMethod preferredLearningMethod;
    private CommunicationPace communicationPace;
    private String preferredLanguage;
    private DomainFocus domainFocus;
    private Integer hoursPerWeek;

    // Metrics
    private Double rating;
    private Integer completedSessions;

    private Boolean isProfileComplete;
}