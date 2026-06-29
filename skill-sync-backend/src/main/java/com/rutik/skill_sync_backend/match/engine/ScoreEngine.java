package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.MatchScoreDTO;
import com.rutik.skill_sync_backend.match.dto.ScoreBreakdownDTO;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScoreEngine {

    private final List<MatchScoreCalculator> calculators;

    public MatchScoreDTO calculateScore(MatchContext context) {
        double skillScore = 0;
        double trustScore = 0;
        double ratingScore = 0;
        double availabilityScore = 0;
        double experienceScore = 0;
        double activityScore = 0;

        for (MatchScoreCalculator calculator : calculators) {
            double score = calculator.calculate(context);
            switch (calculator.getCriterionName()) {
                case "skill" -> skillScore = score;
                case "trust" -> trustScore = score;
                case "rating" -> ratingScore = score;
                case "availability" -> availabilityScore = score;
                case "experience" -> experienceScore = score;
                case "activity" -> activityScore = score;
            }
        }

        double overallScore = skillScore + trustScore + ratingScore + availabilityScore + experienceScore + activityScore;
        double percentage = overallScore; 
        double confidence = overallScore / 100.0;

        ScoreBreakdownDTO breakdown = ScoreBreakdownDTO.builder()
                .skillScore(skillScore)
                .trustScore(trustScore)
                .ratingScore(ratingScore)
                .availabilityScore(availabilityScore)
                .experienceScore(experienceScore)
                .activityScore(activityScore)
                .build();

        return MatchScoreDTO.builder()
                .overallScore(overallScore)
                .percentage(percentage)
                .confidence(confidence)
                .breakdown(breakdown)
                .build();
    }
}
