package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationReasonDTO;
import com.rutik.skill_sync_backend.match.dto.ReasonDetailDTO;
import com.rutik.skill_sync_backend.match.enums.ReasonType;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import com.rutik.skill_sync_backend.match.dto.MatchScoreDTO;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RecommendationReasonBuilder {

    public RecommendationReasonDTO buildReasons(MatchContext context, MatchScoreDTO scoreDto) {
        List<ReasonDetailDTO> details = new ArrayList<>();

        List<UserSkill> currentUserSkills = context.getCurrentUserSkills();
        List<UserSkill> candidateSkills = context.getCandidateSkills();

        Set<Long> myWantSkillIds = currentUserSkills.stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());

        Set<Long> myOfferSkillIds = currentUserSkills.stream()
                .filter(us -> us.getType() == SkillType.OFFER)
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());

        // 1. MATCHED_SKILL / MUTUAL_EXCHANGE
        List<String> offersMatched = candidateSkills.stream()
                .filter(us -> us.getType() == SkillType.OFFER)
                .filter(us -> myWantSkillIds.contains(us.getSkill().getId()))
                .map(us -> us.getSkill().getName())
                .toList();

        List<String> wantsMatched = candidateSkills.stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .filter(us -> myOfferSkillIds.contains(us.getSkill().getId()))
                .map(us -> us.getSkill().getName())
                .toList();

        double skillScore = scoreDto.getBreakdown().getSkillScore();
        if (!offersMatched.isEmpty() && !wantsMatched.isEmpty()) {
            details.add(ReasonDetailDTO.builder()
                    .reasonType(ReasonType.MUTUAL_EXCHANGE)
                    .message("Excellent Mutual Exchange: Offers " + String.join(", ", offersMatched) + " & Wants " + String.join(", ", wantsMatched))
                    .weightContribution(skillScore)
                    .build());
        } else {
            for (String skill : offersMatched) {
                details.add(ReasonDetailDTO.builder()
                        .reasonType(ReasonType.MATCHED_SKILL)
                        .message("Offers " + skill)
                        .weightContribution(offersMatched.isEmpty() ? 0.0 : skillScore / offersMatched.size())
                        .build());
            }
            for (String skill : wantsMatched) {
                details.add(ReasonDetailDTO.builder()
                        .reasonType(ReasonType.MATCHED_SKILL)
                        .message("Needs " + skill)
                        .weightContribution(0.0)
                        .build());
            }
        }

        // 2. HIGH_TRUST
        double trust = context.getCandidateTrustScore() != null ? context.getCandidateTrustScore() : 0.0;
        if (trust >= 80.0) {
            details.add(ReasonDetailDTO.builder()
                    .reasonType(ReasonType.HIGH_TRUST)
                    .message("High Trust Score (" + String.format("%.0f", trust) + "/100)")
                    .weightContribution(scoreDto.getBreakdown().getTrustScore())
                    .build());
        }

        // 3. TOP_RATED
        double rating = context.getCandidate().getRating() != null ? context.getCandidate().getRating() : 0.0;
        if (rating >= 4.5) {
            details.add(ReasonDetailDTO.builder()
                    .reasonType(ReasonType.TOP_RATED)
                    .message("Top Rated (" + rating + "★)")
                    .weightContribution(scoreDto.getBreakdown().getRatingScore())
                    .build());
        }

        // 4. SHARED_AVAILABILITY
        double availabilityScore = scoreDto.getBreakdown().getAvailabilityScore();
        if (availabilityScore > 0.0) {
            details.add(ReasonDetailDTO.builder()
                    .reasonType(ReasonType.SHARED_AVAILABILITY)
                    .message("Shared Availability Slots")
                    .weightContribution(availabilityScore)
                    .build());
        }

        // 5. HIGH_EXPERIENCE
        int completed = context.getCandidate().getCompletedSessions() != null ? context.getCandidate().getCompletedSessions() : 0;
        if (completed >= 5) {
            details.add(ReasonDetailDTO.builder()
                    .reasonType(ReasonType.HIGH_EXPERIENCE)
                    .message("Completed " + completed + " Sessions")
                    .weightContribution(scoreDto.getBreakdown().getExperienceScore())
                    .build());
        }

        return RecommendationReasonDTO.builder()
                .reasons(details)
                .build();
    }
}
