package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TrustScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        double trust = context.getCandidateTrustScore() != null ? context.getCandidateTrustScore() : 0.0;
        return (trust / 100.0) * getMaxScore();
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getTrust();
    }

    @Override
    public String getCriterionName() {
        return "trust";
    }
}
