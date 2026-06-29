package com.rutik.skill_sync_backend.match.strategy;

import com.rutik.skill_sync_backend.match.dto.ExchangeSkillDTO;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.MutualMatchDTO;
import com.rutik.skill_sync_backend.match.mapper.MatchMapper;
import com.rutik.skill_sync_backend.match.model.MatchStrategyContext;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MutualMatchStrategy implements MatchStrategy {

    @Override
    public List<MatchResponseDTO> match(MatchStrategyContext context) {
        if (context.getCandidates() == null || context.getCandidates().isEmpty()) {
            return List.of();
        }

        // Current User's Wants & Offers
        List<UserSkill> myWants = context.getCurrentUserSkills().stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .toList();

        List<UserSkill> myOffers = context.getCurrentUserSkills().stream()
                .filter(us -> us.getType() == SkillType.OFFER)
                .toList();

        Set<Long> myWantSkillIds = myWants.stream()
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());

        Set<Long> myOfferSkillIds = myOffers.stream()
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());

        List<MatchResponseDTO> results = new ArrayList<>();

        for (User candidate : context.getCandidates()) {
            List<UserSkill> candidateSkills = context.getCandidateSkillsMap().getOrDefault(candidate.getId(), List.of());

            // 1. TAKE: Candidate offers what Current User wants
            List<UserSkill> candidateOffersMatching = candidateSkills.stream()
                    .filter(us -> us.getType() == SkillType.OFFER)
                    .filter(us -> myWantSkillIds.contains(us.getSkill().getId()))
                    .toList();

            // 2. GIVE: Candidate wants what Current User offers
            List<UserSkill> candidateWantsMatching = candidateSkills.stream()
                    .filter(us -> us.getType() == SkillType.WANT)
                    .filter(us -> myOfferSkillIds.contains(us.getSkill().getId()))
                    .toList();

            // It's a mutual match only if both lists are non-empty
            if (!candidateOffersMatching.isEmpty() && !candidateWantsMatching.isEmpty()) {
                List<ExchangeSkillDTO> exchangeSkills = new ArrayList<>();

                // Add TAKEs
                for (UserSkill offer : candidateOffersMatching) {
                    exchangeSkills.add(ExchangeSkillDTO.builder()
                            .skillName(offer.getSkill().getName())
                            .direction("TAKE")
                            .level(offer.getLevel().name())
                            .build());
                }

                // Add GIVEs (We find current user's matching offers to show the level of what the current user is giving)
                for (UserSkill want : candidateWantsMatching) {
                    // Find corresponding current user offer skill level
                    UserSkill myOffer = myOffers.stream()
                            .filter(us -> us.getSkill().getId().equals(want.getSkill().getId()))
                            .findFirst()
                            .orElse(want); // fallback to want details if not found

                    exchangeSkills.add(ExchangeSkillDTO.builder()
                            .skillName(want.getSkill().getName())
                            .direction("GIVE")
                            .level(myOffer.getLevel().name())
                            .build());
                }

                results.add(MatchResponseDTO.builder()
                        .candidate(MatchMapper.toCandidateDTO(candidate))
                        .matchType("MUTUAL")
                        .mutualMatch(MutualMatchDTO.builder()
                                .exchangeSkills(exchangeSkills)
                                .build())
                        .build());
            }
        }

        return results;
    }

    @Override
    public boolean supports(String strategyName) {
        return "mutual".equalsIgnoreCase(strategyName);
    }
}
