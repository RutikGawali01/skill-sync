package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EligibilityFilter {

    private final List<EligibilityRule> rules;

    public List<User> filter(List<User> candidates) {
        if (candidates == null) {
            return List.of();
        }
        return candidates.stream()
                .filter(this::isEligible)
                .toList();
    }

    private boolean isEligible(User candidate) {
        return rules.stream().allMatch(rule -> rule.isEligible(candidate));
    }
}
