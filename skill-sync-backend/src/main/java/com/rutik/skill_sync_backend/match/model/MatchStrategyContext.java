package com.rutik.skill_sync_backend.match.model;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class MatchStrategyContext {
    private final User currentUser;
    private final List<UserSkill> currentUserSkills;
    private final List<User> candidates;
    private final Map<Long, List<UserSkill>> candidateSkillsMap;
}
