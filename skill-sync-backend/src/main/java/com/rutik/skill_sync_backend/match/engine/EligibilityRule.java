package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.user.entity.User;

public interface EligibilityRule {
    boolean isEligible(User candidate);
}
