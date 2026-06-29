package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class ActivityScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        LocalDateTime lastActive = context.getCandidate().getUpdatedAt() != null ? context.getCandidate().getUpdatedAt() : context.getCandidate().getCreatedAt();
        if (lastActive == null) {
            return 1.0;
        }

        long days = Math.abs(ChronoUnit.DAYS.between(lastActive, LocalDateTime.now()));
        double rawScore;
        if (days <= 7) {
            rawScore = 5.0;
        } else if (days <= 30) {
            rawScore = 3.0;
        } else {
            rawScore = 1.0;
        }

        return (rawScore / 5.0) * getMaxScore();
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getActivity();
    }

    @Override
    public String getCriterionName() {
        return "activity";
    }
}
