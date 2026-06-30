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
import com.rutik.skill_sync_backend.common.dto.PageResponse;
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
    public PageResponse<RecommendationDTO> getRecommendations(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    ) {
        log.info("Matching started for user {}, page={}, size={}, search={}, sortBy={}, sortDir={}", userId, page, size, search, sortBy, sortDir);
        StopWatch stopWatch = new StopWatch("MatchingPipeline");

        if (userId == null) {
            throw new BadRequestException("UserId must not be null");
        }

        // 1. Validation
        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new BadRequestException("Page size must be greater than zero");
        }
        if (size > 50) {
            throw new BadRequestException("Page size must not be greater than 50");
        }
        String direction = sortDir.toLowerCase();
        if (!direction.equals("asc") && !direction.equals("desc")) {
            throw new BadRequestException("Invalid sort direction: " + sortDir + ". Allowed values are 'asc' or 'desc'");
        }

        String sortField = sortBy == null || sortBy.isBlank() ? "matchScore" : sortBy;
        Set<String> allowedFields = Set.of("matchScore", "rating", "completedSessions", "name", "createdAt");
        if (!allowedFields.contains(sortField)) {
            throw new BadRequestException("Invalid sortBy field: '" + sortBy + "'. Allowed fields are: " + allowedFields);
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
            return PageResponse.from(List.of(), page, size, 0);
        }

        List<Long> wantSkillIds = myWants.stream()
                .map(us -> us.getSkill().getId())
                .toList();

        stopWatch.start("CandidateDiscovery");
        List<User> rawCandidates;
        if (search == null || search.isBlank()) {
            rawCandidates = userRepository.findCandidatesForMatching(wantSkillIds, userId);
        } else {
            rawCandidates = userRepository.findCandidatesForMatchingWithSearch(wantSkillIds, userId, search.trim());
        }
        stopWatch.stop();

        stopWatch.start("EligibilityFilter");
        List<User> eligibleCandidates = eligibilityFilter.filter(rawCandidates);
        stopWatch.stop();

        log.info("Candidate discovery completed: RawCount={}, EligibleCount={}", rawCandidates.size(), eligibleCandidates.size());

        if (eligibleCandidates.isEmpty()) {
            return PageResponse.from(List.of(), page, size, 0);
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

        // Sort based on parameter
        Comparator<RecommendationDTO> comparator;
        switch (sortField) {
            case "rating":
                comparator = Comparator.comparingDouble(r -> r.getCandidate().getRating() != null ? r.getCandidate().getRating() : 0.0);
                break;
            case "completedSessions":
                comparator = Comparator.comparingInt(r -> r.getCandidate().getCompletedSessions() != null ? r.getCandidate().getCompletedSessions() : 0);
                break;
            case "name":
                comparator = Comparator.comparing(r -> r.getCandidate().getName() != null ? r.getCandidate().getName().toLowerCase() : "");
                break;
            case "createdAt":
                comparator = Comparator.comparing((RecommendationDTO r) -> {
                    User u = candidateMap.get(r.getCandidate().getId());
                    return u != null && u.getCreatedAt() != null ? u.getCreatedAt() : java.time.LocalDateTime.MIN;
                });
                break;
            case "matchScore":
            default:
                comparator = Comparator.comparingDouble(r -> r.getMatchScore() != null ? r.getMatchScore().getPercentage() : 0.0);
                break;
        }

        if ("desc".equals(direction)) {
            comparator = comparator.reversed();
        }

        List<RecommendationDTO> sortedRecommendations = new ArrayList<>(ranked);
        sortedRecommendations.sort(comparator);

        int totalElements = sortedRecommendations.size();
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        List<RecommendationDTO> paginatedList = List.of();
        if (start < totalElements) {
            paginatedList = sortedRecommendations.subList(start, end);
        }

        log.info("Matching completed in {} ms. Total Recommendations={}", stopWatch.getTotalTimeMillis(), ranked.size());
        if (log.isDebugEnabled()) {
            log.debug("Time Breakdown: {}", stopWatch.prettyPrint());
        }

        return PageResponse.from(paginatedList, page, size, totalElements);
    }
}
