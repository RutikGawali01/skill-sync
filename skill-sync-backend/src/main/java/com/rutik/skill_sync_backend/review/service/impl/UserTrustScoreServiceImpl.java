package com.rutik.skill_sync_backend.review.service.impl;

import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.review.dto.response.UserTrustScoreResponseDto;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.entity.UserTrustScore;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.review.repository.UserTrustScoreRepository;
import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserTrustScoreServiceImpl
        implements UserTrustScoreService {

    private final UserTrustScoreRepository trustScoreRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public void calculateTrustScore(User user) {
        UserTrustScore trustScore = trustScoreRepository.findByUser(user)
                .orElseGet(() -> createNewTrustScore(user));

        List<Session> completed = sessionRepository.findAll().stream()
                .filter(s -> (s.getProvider().getId().equals(user.getId()) || s.getRequester().getId().equals(user.getId()))
                        && s.getStatus() == SessionStatus.COMPLETED)
                .toList();

        List<Session> cancelled = sessionRepository.findAll().stream()
                .filter(s -> (s.getProvider().getId().equals(user.getId()) || s.getRequester().getId().equals(user.getId()))
                        && s.getStatus() == SessionStatus.CANCELLED)
                .toList();

        int completedCount = completed.size();
        int cancelledCount = cancelled.size();
        int totalSessions = completedCount + cancelledCount;
        double completionRate = totalSessions > 0 ? (double) completedCount / totalSessions : 0.0;

        List<Review> reviews = reviewRepository.findByReviewee(user);
        int totalReviews = reviews.size();
        int totalRatingSum = reviews.stream().mapToInt(Review::getOverallRating).sum();
        double averageRating = totalReviews > 0 ? (double) totalRatingSum / totalReviews : 0.0;

        trustScore.setCompletedSessions(completedCount);
        trustScore.setCancelledSessions(cancelledCount);
        trustScore.setCompletionRate(completionRate);
        trustScore.setTotalReviews(totalReviews);
        trustScore.setTotalRatingSum(totalRatingSum);
        trustScore.setAverageRating(averageRating);

        calculateTrustScore(trustScore);

        trustScoreRepository.save(trustScore);

        user.setCompletedSessions(completedCount);
        user.setRating(averageRating);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateTrustMetrics(User user, Review review) {

        UserTrustScore trustScore =
                trustScoreRepository.findByUser(user)
                        .orElseGet(() -> createNewTrustScore(user));

        updateRatingMetrics(trustScore, review);

        calculateTrustScore(trustScore);

        trustScoreRepository.save(trustScore);
    }

    private UserTrustScore createNewTrustScore(User user) {

        return UserTrustScore.builder()
                .user(user)
                .build();
    }

    private void updateRatingMetrics(
            UserTrustScore trustScore,
            Review review
    ) {

        int updatedTotalReviews =
                trustScore.getTotalReviews() + 1;

        int updatedRatingSum =
                trustScore.getTotalRatingSum()
                        + review.getOverallRating();

        double averageRating =
                (double) updatedRatingSum / updatedTotalReviews;

        trustScore.setTotalReviews(updatedTotalReviews);
        trustScore.setTotalRatingSum(updatedRatingSum);
        trustScore.setAverageRating(averageRating);
    }

    private void calculateTrustScore(
            UserTrustScore trustScore
    ) {

        double ratingComponent =
                (trustScore.getAverageRating() / 5.0) * 70;

        double completionComponent =
                trustScore.getCompletionRate() * 30;

        double finalTrustScore =
                ratingComponent + completionComponent;

        trustScore.setTrustScore(finalTrustScore);
    }

    @Override
    @Transactional(readOnly = true)
    public UserTrustScoreResponseDto getUserTrustScore(
            Long userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        UserTrustScore trustScore =
                trustScoreRepository.findByUser(user)
                        .orElseGet(() ->
                                createNewTrustScore(user)
                        );

        return UserTrustScoreResponseDto.builder()
                .userId(user.getId())
                .averageRating(
                        trustScore.getAverageRating()
                )
                .totalReviews(
                        trustScore.getTotalReviews()
                )
                .completedSessions(
                        trustScore.getCompletedSessions()
                )
                .cancelledSessions(
                        trustScore.getCancelledSessions()
                )
                .completionRate(
                        trustScore.getCompletionRate()
                )
                .trustScore(
                        trustScore.getTrustScore()
                )
                .build();
    }
}
