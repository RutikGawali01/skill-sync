package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.model.MatchContext;

public interface MatchScoreCalculator {
    double calculate(MatchContext context);
    double getMaxScore();
    String getCriterionName();
}
