package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.availability.repository.AvailabilityRepository;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.match.dto.*;
import com.rutik.skill_sync_backend.match.model.MatchContext;
import com.rutik.skill_sync_backend.review.entity.UserTrustScore;
import com.rutik.skill_sync_backend.review.repository.UserTrustScoreRepository;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class RuleBasedRecommendationProvider implements RecommendationProvider {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserTrustScoreRepository trustScoreRepository;
    private final AvailabilityRepository availabilityRepository;
    private final EligibilityFilter eligibilityFilter;
    private final ScoreEngine scoreEngine;
    private final RecommendationReasonBuilder reasonBuilder;
    private final RankingEngine rankingEngine;

    @Override
    public Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable) {
        log.info("Matching started for user {}", userId);
        StopWatch stopWatch = new StopWatch("MatchingPipeline");

        if (userId == null) {
            throw new BadRequestException("UserId must not be null");
        }

        stopWatch.start("FetchUser");
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<UserSkill> mySkills = userSkillRepository.findByUserId(userId);
        List<UserSkill> myWants = mySkills.stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .toList();
        stopWatch.stop();

        if (myWants.isEmpty()) {
            log.warn("User has no wanted skills. userId={}", userId);
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Long> wantSkillIds = myWants.stream()
                .map(us -> us.getSkill().getId())
                .toList();

        stopWatch.start("CandidateDiscovery");
        List<User> rawCandidates = userRepository.findCandidatesForMatching(wantSkillIds, userId);
        stopWatch.stop();

        stopWatch.start("EligibilityFilter");
        List<User> eligibleCandidates = eligibilityFilter.filter(rawCandidates);
        stopWatch.stop();

        log.info("Candidate discovery completed: RawCount={}, EligibleCount={}", rawCandidates.size(), eligibleCandidates.size());

        if (eligibleCandidates.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        stopWatch.start("BulkFetchAuxiliaryData");
        List<UserTrustScore> trustScores = trustScoreRepository.findByUserIn(eligibleCandidates);
        Map<Long, Double> trustScoresMap = trustScores.stream()
                .collect(Collectors.toMap(ts -> ts.getUser().getId(), UserTrustScore::getTrustScore, (a, b) -> a));

        List<User> allUsersForAvailability = new ArrayList<>(eligibleCandidates);
        allUsersForAvailability.add(currentUser);
        List<Availability> availabilities = availabilityRepository.findByUserIn(allUsersForAvailability);
        Map<Long, List<Availability>> availabilitySlotsMap = availabilities.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        List<Long> candidateIds = eligibleCandidates.stream().map(User::getId).toList();
        List<UserSkill> candidateSkillsList = userSkillRepository.findByUserIdIn(candidateIds);
        Map<Long, List<UserSkill>> candidateSkillsMap = candidateSkillsList.stream()
                .collect(Collectors.groupingBy(us -> us.getUser().getId()));
        stopWatch.stop();

        stopWatch.start("ScoringAndExplanation");
        List<RecommendationDTO> recommendations = new ArrayList<>();
        for (User candidate : eligibleCandidates) {
            List<UserSkill> candSkills = candidateSkillsMap.getOrDefault(candidate.getId(), List.of());
            double candidateTrust = trustScoresMap.getOrDefault(candidate.getId(), 0.0);
            List<Availability> candAvailabilities = availabilitySlotsMap.getOrDefault(candidate.getId(), List.of());
            List<Availability> myAvailabilities = availabilitySlotsMap.getOrDefault(currentUser.getId(), List.of());

            MatchContext context = MatchContext.builder()
                    .currentUser(currentUser)
                    .currentUserSkills(mySkills)
                    .candidate(candidate)
                    .candidateSkills(candSkills)
                    .candidateTrustScore(candidateTrust)
                    .currentUserAvailability(myAvailabilities)
                    .candidateAvailability(candAvailabilities)
                    .build();

            MatchScoreDTO scoreDto = scoreEngine.calculateScore(context);
            RecommendationReasonDTO reasonDto = reasonBuilder.buildReasons(context, scoreDto);

            recommendations.add(RecommendationDTO.builder()
                    .candidate(com.rutik.skill_sync_backend.match.mapper.MatchMapper.toCandidateDTO(candidate))
                    .matchScore(scoreDto)
                    .recommendationReason(reasonDto)
                    .build());
        }
        stopWatch.stop();

        stopWatch.start("Ranking");
        Map<Long, User> candidateMap = eligibleCandidates.stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        List<RecommendationDTO> ranked = rankingEngine.rank(recommendations, candidateMap);
        stopWatch.stop();

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), ranked.size());
        List<RecommendationDTO> paginatedList = List.of();
        if (start < ranked.size()) {
            paginatedList = ranked.subList(start, end);
        }

        log.info("Matching completed in {} ms. Total Recommendations={}", stopWatch.getTotalTimeMillis(), ranked.size());
        if (log.isDebugEnabled()) {
            log.debug("Time Breakdown: {}", stopWatch.prettyPrint());
        }

        return new PageImpl<>(paginatedList, pageable, ranked.size());
    }
}
