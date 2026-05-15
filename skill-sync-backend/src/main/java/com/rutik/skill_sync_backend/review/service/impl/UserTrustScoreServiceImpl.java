package com.rutik.skill_sync_backend.review.service.impl;

import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.review.dto.response.UserTrustScoreResponseDto;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.entity.UserTrustScore;
import com.rutik.skill_sync_backend.review.repository.UserTrustScoreRepository;
import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserTrustScoreServiceImpl
        implements UserTrustScoreService {

    private final UserTrustScoreRepository trustScoreRepository;
    private final UserRepository userRepository;


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
