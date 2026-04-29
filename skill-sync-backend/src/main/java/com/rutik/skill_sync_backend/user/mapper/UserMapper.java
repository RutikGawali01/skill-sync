package com.rutik.skill_sync_backend.user.mapper;

import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;
import com.rutik.skill_sync_backend.user.entity.User;

public class UserMapper {

    public static UserProfileResponseDTO toDTO(User user) {

        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePicUrl(user.getProfilePicUrl())
                .location(user.getLocation())
                .timezone(user.getTimezone())

                .learningGoal(user.getLearningGoal())
                .goalTimeline(user.getGoalTimeline())
                .teachingMotivation(user.getTeachingMotivation())
                .teachingApproaches(user.getTeachingApproaches())
                .preferredLearningMethod(user.getPreferredLearningMethod())
                .communicationPace(user.getCommunicationPace())
                .preferredLanguage(user.getPreferredLanguage())
                .domainFocus(user.getDomainFocus())
                .hoursPerWeek(user.getHoursPerWeek())

                .rating(user.getRating())
                .completedSessions(user.getCompletedSessions())

                .isProfileComplete(user.getIsProfileComplete())
                .build();
    }
}