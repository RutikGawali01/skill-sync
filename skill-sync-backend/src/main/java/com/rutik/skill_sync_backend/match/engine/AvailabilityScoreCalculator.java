package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AvailabilityScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        List<Availability> mySlots = context.getCurrentUserAvailability();
        List<Availability> candidateSlots = context.getCandidateAvailability();

        if (mySlots == null || candidateSlots == null || mySlots.isEmpty() || candidateSlots.isEmpty()) {
            return 0.0;
        }

        for (Availability mySlot : mySlots) {
            for (Availability candidateSlot : candidateSlots) {
                if (mySlot.getDay() == candidateSlot.getDay()) {
                    if (mySlot.getStartTime().isBefore(candidateSlot.getEndTime()) &&
                        candidateSlot.getStartTime().isBefore(mySlot.getEndTime())) {
                        return getMaxScore();
                    }
                }
            }
        }

        return 0.0;
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getAvailability();
    }

    @Override
    public String getCriterionName() {
        return "availability";
    }
}
