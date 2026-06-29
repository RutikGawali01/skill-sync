package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class HasAvailabilityRule implements EligibilityRule {
    @Override
    public boolean isEligible(User candidate) {
        return candidate != null && candidate.getAvailabilitySlots() != null && !candidate.getAvailabilitySlots().isEmpty();
    }
}
