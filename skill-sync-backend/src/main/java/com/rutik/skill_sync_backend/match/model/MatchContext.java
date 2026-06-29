package com.rutik.skill_sync_backend.match.model;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MatchContext {
    private final User currentUser;
    private final List<UserSkill> currentUserSkills;
    private final User candidate;
    private final List<UserSkill> candidateSkills;
    private final Double candidateTrustScore;
    private final List<Availability> currentUserAvailability;
    private final List<Availability> candidateAvailability;
}
