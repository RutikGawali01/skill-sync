package com.rutik.skill_sync_backend.match.mapper;

import com.rutik.skill_sync_backend.match.dto.MatchCandidateDTO;
import com.rutik.skill_sync_backend.user.entity.User;

public class MatchMapper {

    public static MatchCandidateDTO toCandidateDTO(User user) {
        if (user == null) {
            return null;
        }
        return MatchCandidateDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePicUrl(user.getProfilePicUrl())
                .location(user.getLocation())
                .rating(user.getRating() == null ? 0.0 : user.getRating())
                .completedSessions(user.getCompletedSessions() == null ? 0 : user.getCompletedSessions())
                .build();
    }
}
