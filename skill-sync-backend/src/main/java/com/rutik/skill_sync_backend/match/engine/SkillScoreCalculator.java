package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.config.MatchWeightProperties;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SkillScoreCalculator implements MatchScoreCalculator {

    private final MatchWeightProperties weightProperties;

    @Override
    public double calculate(MatchContext context) {
        List<UserSkill> myWants = context.getCurrentUserSkills().stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .toList();

        List<UserSkill> candidateSkills = context.getCandidateSkills();
        if (myWants.isEmpty() || candidateSkills == null) {
            return 0.0;
        }

        double rawScore = 0.0;
        for (UserSkill want : myWants) {
            for (UserSkill offer : candidateSkills) {
                if (offer.getType() == SkillType.OFFER && offer.getSkill().getId().equals(want.getSkill().getId())) {
                    rawScore += 30.0;

                    if (want.getLevel() != null && offer.getLevel() != null) {
                        int diff = Math.abs(want.getLevel().getValue() - offer.getLevel().getValue());
                        if (diff == 0) {
                            rawScore += 20.0;
                        } else if (diff == 1) {
                            rawScore += 10.0;
                        } else {
                            rawScore += 5.0;
                        }
                    }
                }
            }
        }

        double capped = Math.min(rawScore, 50.0);
        return (capped / 50.0) * getMaxScore();
    }

    @Override
    public double getMaxScore() {
        return weightProperties.getSkill();
    }

    @Override
    public String getCriterionName() {
        return "skill";
    }
}
