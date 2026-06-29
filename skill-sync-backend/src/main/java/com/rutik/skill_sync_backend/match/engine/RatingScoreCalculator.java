package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RatingScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        double rating = context.getCandidate().getRating() != null ? context.getCandidate().getRating() : 0.0;
        return (rating / 5.0) * getMaxScore();
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getRating();
    }

    @Override
    public String getCriterionName() {
        return "rating";
    }
}
