package com.rutik.skill_sync_backend.match.service.impl;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.match.entity.Match;
import com.rutik.skill_sync_backend.match.repository.MatchRepository;
import com.rutik.skill_sync_backend.match.service.interfaces.MatchService;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import com.rutik.skill_sync_backend.match.strategy.MatchStrategy;
import com.rutik.skill_sync_backend.match.engine.EligibilityFilter;
import com.rutik.skill_sync_backend.match.engine.RecommendationEngine;
import com.rutik.skill_sync_backend.match.engine.RankingEngine;
import com.rutik.skill_sync_backend.match.model.MatchStrategyContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.rutik.skill_sync_backend.review.entity.UserTrustScore;
import com.rutik.skill_sync_backend.review.repository.UserTrustScoreRepository;
import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.availability.repository.AvailabilityRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchServiceImpl implements MatchService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final MatchRepository matchRepository;
    private final List<MatchStrategy> strategies;
    private final EligibilityFilter eligibilityFilter;
    private final UserTrustScoreRepository trustScoreRepository;
    private final AvailabilityRepository availabilityRepository;
    private final RecommendationEngine recommendationEngine;
    private final RankingEngine rankingEngine;

    @Override
    @Transactional
    public List<MatchResponseDTO> findMatches(Long userId) {

        log.info("Finding matches for userId={}", userId);

        // ✅ 1. Validate input
        if (userId == null) {
            throw new BadRequestException("UserId must not be null");
        }

        // ✅ 2. Validate user existence
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // ✅ 3. Fetch user skills
        List<UserSkill> mySkills = Optional.ofNullable(userSkillRepository.findByUserId(userId))
                .orElse(Collections.emptyList());

        if (mySkills.isEmpty()) {
            log.warn("No skills found for userId={}", userId);
            return Collections.emptyList();
        }

        // ✅ 4. Separate OFFER & WANT
        List<UserSkill> myOffers = mySkills.stream()
                .filter(s -> s.getType() == SkillType.OFFER && s.getSkill() != null)
                .toList();

        List<UserSkill> myWants = mySkills.stream()
                .filter(s -> s.getType() == SkillType.WANT && s.getSkill() != null)
                .toList();

        if (myOffers.isEmpty() || myWants.isEmpty()) {
            log.warn("User must have both OFFER and WANT skills. userId={}", userId);
            return Collections.emptyList();
        }

        Map<Long, Double> matchScoreMap = new HashMap<>();

        // ✅ 5. Mutual Matching (STRICT + SAFE)
        for (UserSkill wantSkill : myWants) {

            Long wantedSkillId = wantSkill.getSkill().getId();

            List<UserSkill> candidates = Optional.ofNullable(
                    userSkillRepository.findBySkillAndType(wantedSkillId, SkillType.OFFER)
            ).orElse(Collections.emptyList());

            for (UserSkill candidateSkill : candidates) {

                if (candidateSkill == null || candidateSkill.getUser() == null) continue;

                User candidateUser = candidateSkill.getUser();

                // ❌ Skip self
                if (candidateUser.getId().equals(userId)) continue;

                // ✅ Fetch candidate skills
                List<UserSkill> candidateSkills = Optional.ofNullable(
                        userSkillRepository.findByUserId(candidateUser.getId())
                ).orElse(Collections.emptyList());

                if (candidateSkills.isEmpty()) continue;

                // ✅ STRICT mutual matching (correct logic)
                boolean reverseMatch = false;

                for (UserSkill candidateWant : candidateSkills) {

                    if (candidateWant.getType() != SkillType.WANT) continue;
                    if (candidateWant.getSkill() == null) continue;

                    for (UserSkill myOffer : myOffers) {

                        if (myOffer.getSkill() == null) continue;

                        if (myOffer.getSkill().getId()
                                .equals(candidateWant.getSkill().getId())) {

                            reverseMatch = true;
                            break;
                        }
                    }

                    if (reverseMatch) break;
                }

                if (!reverseMatch) continue;

                // ✅ Score calculation
                double score = calculateScore(wantSkill, candidateSkill, candidateUser);

                matchScoreMap.merge(candidateUser.getId(), score, Double::sum);
            }
        }

        // ✅ 6. Convert to DTO + persist matches
        return matchScoreMap.entrySet()
                .stream()
                .map(entry -> {

                    User matchedUser = userRepository.findById(entry.getKey())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "User not found with id: " + entry.getKey()
                            ));

                    saveMatchIfNotExists(currentUser, matchedUser, entry.getValue());

                    return MatchResponseDTO.builder()
                            .candidate(com.rutik.skill_sync_backend.match.mapper.MatchMapper.toCandidateDTO(matchedUser))
                            .score(entry.getValue())
                            .build();
                })
                .sorted(Comparator.comparingDouble(MatchResponseDTO::getScore).reversed())
                .toList();
    }

    // 🎯 Ranking Algorithm
    private double calculateScore(UserSkill want, UserSkill offer, User candidate) {

        double score = 0;

        // ✅ Skill match
        score += 50;

        // ✅ Level match (safe)
        if (want.getLevel() != null && offer.getLevel() != null) {

            int diff = Math.abs(
                    want.getLevel().getValue() - offer.getLevel().getValue()
            );

            if (diff == 0) score += 20;
            else if (diff == 1) score += 10;
            else score += 5;
        }

        // ✅ Rating (safe)
        double rating = candidate.getRating() != null ? candidate.getRating() : 0;
        score += rating * 5;

        return score;
    }

    // ✅ Prevent duplicate matches
    private void saveMatchIfNotExists(User a, User b, double score) {

        boolean exists = matchRepository.findByUserAId(a.getId())
                .stream()
                .anyMatch(m -> m.getUserB().getId().equals(b.getId()));

        if (exists) {
            log.debug("Match already exists between {} and {}", a.getId(), b.getId());
            return;
        }

        Match match = Match.builder()
                .userA(a)
                .userB(b)
                .score(score)
                .createdAt(LocalDateTime.now())
                .build();

        matchRepository.save(match);
    }

    @Override
    @Transactional
    public List<MatchResponseDTO> findBasicMatches(Long userId) {
        log.info("Finding basic matches for userId={}", userId);
        return findMatchesUsingStrategy(userId, "basic");
    }

    @Override
    @Transactional
    public List<MatchResponseDTO> findMutualMatches(Long userId) {
        log.info("Finding mutual matches for userId={}", userId);
        return findMatchesUsingStrategy(userId, "mutual");
    }

    private List<MatchResponseDTO> findMatchesUsingStrategy(Long userId, String strategyName) {
        if (userId == null) {
            throw new BadRequestException("UserId must not be null");
        }

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Get user wanted skills
        List<UserSkill> mySkills = userSkillRepository.findByUserId(userId);
        List<UserSkill> myWants = mySkills.stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .toList();

        if (myWants.isEmpty()) {
            log.warn("User has no wanted skills. userId={}", userId);
            return List.of();
        }

        List<Long> wantSkillIds = myWants.stream()
                .map(us -> us.getSkill().getId())
                .toList();

        // 1. Candidate Discovery
        List<User> rawCandidates = userRepository.findCandidatesForMatching(wantSkillIds, userId);

        // 2. Eligibility Filter
        List<User> eligibleCandidates = eligibilityFilter.filter(rawCandidates);

        if (eligibleCandidates.isEmpty()) {
            return List.of();
        }

        List<Long> candidateIds = eligibleCandidates.stream()
                .map(User::getId)
                .toList();

        // Avoid N+1 select: fetch all candidate skills in one query
        List<UserSkill> candidateSkills = userSkillRepository.findByUserIdIn(candidateIds);
        Map<Long, List<UserSkill>> candidateSkillsMap = candidateSkills.stream()
                .collect(Collectors.groupingBy(us -> us.getUser().getId()));

        // Create MatchStrategyContext
        MatchStrategyContext context = MatchStrategyContext.builder()
                .currentUser(currentUser)
                .currentUserSkills(mySkills)
                .candidates(eligibleCandidates)
                .candidateSkillsMap(candidateSkillsMap)
                .build();

        // Apply selected strategy
        MatchStrategy strategy = strategies.stream()
                .filter(s -> s.supports(strategyName))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Matching strategy not found: " + strategyName));

        return strategy.match(context);
    }

    @Override
    @Transactional
    public Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable) {
        log.info("Generating recommendations for userId={}, pageable={}", userId, pageable);
        return recommendationEngine.getRecommendations(userId, pageable);
    }

    @Override
    @Transactional
    public Page<RecommendationDTO> getRankedMatches(Long userId, Pageable pageable) {
        log.info("Generating ranked matches for userId={}, pageable={}", userId, pageable);
        return recommendationEngine.getRecommendations(userId, pageable);
    }
}