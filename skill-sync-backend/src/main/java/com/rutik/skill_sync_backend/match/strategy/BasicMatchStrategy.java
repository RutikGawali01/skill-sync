package com.rutik.skill_sync_backend.match.strategy;

import com.rutik.skill_sync_backend.match.dto.BasicMatchDTO;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
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
public class BasicMatchStrategy implements MatchStrategy {

    @Override
    public List<MatchResponseDTO> match(MatchStrategyContext context) {
        if (context.getCandidates() == null || context.getCandidates().isEmpty()) {
            return List.of();
        }

        // Get current user's wanted skill IDs
        Set<Long> wantedSkillIds = context.getCurrentUserSkills().stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());

        List<MatchResponseDTO> results = new ArrayList<>();

        for (User candidate : context.getCandidates()) {
            List<UserSkill> candidateSkills = context.getCandidateSkillsMap().getOrDefault(candidate.getId(), List.of());

            // Extract matching skill names (candidate offers what current user wants)
            List<String> matchingSkills = candidateSkills.stream()
                    .filter(us -> us.getType() == SkillType.OFFER)
                    .filter(us -> wantedSkillIds.contains(us.getSkill().getId()))
                    .map(us -> us.getSkill().getName())
                    .toList();

            if (!matchingSkills.isEmpty()) {
                results.add(MatchResponseDTO.builder()
                        .candidate(MatchMapper.toCandidateDTO(candidate))
                        .matchType("BASIC")
                        .basicMatch(BasicMatchDTO.builder()
                                .matchingSkills(matchingSkills)
                                .build())
                        .build());
            }
        }

        return results;
    }

    @Override
    public boolean supports(String strategyName) {
        return "basic".equalsIgnoreCase(strategyName);
    }
}
