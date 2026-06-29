package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExperienceScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        int completed = context.getCandidate().getCompletedSessions() != null ? context.getCandidate().getCompletedSessions() : 0;
        double rawScore = Math.min(completed * 0.5, 5.0);
        return (rawScore / 5.0) * getMaxScore();
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getExperience();
    }

    @Override
    public String getCriterionName() {
        return "experience";
    }
}
