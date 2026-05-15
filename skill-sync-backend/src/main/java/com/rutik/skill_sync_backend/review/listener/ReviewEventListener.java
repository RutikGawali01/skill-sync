package com.rutik.skill_sync_backend.review.listener;

import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.event.ReviewSubmittedEvent;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// responsibility - listen to ReviewSubmittedEvent
@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewEventListener {

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final UserTrustScoreService trustScoreService;

    @EventListener
    @Transactional
    public void handleReviewSubmittedEvent(
            ReviewSubmittedEvent event
    ) {

        log.info(
                "Handling ReviewSubmittedEvent for reviewId={}",
                event.getReviewId()
        );

        Review review =
                reviewRepository.findById(
                        event.getReviewId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found with id: "
                                        + event.getReviewId()
                        )
                );

        User reviewee =
                userRepository.findById(
                        event.getRevieweeId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + event.getRevieweeId()
                        )
                );

        trustScoreService.updateTrustMetrics(
                reviewee,
                review
        );

        log.info(
                "Trust metrics updated successfully for userId={}",
                reviewee.getId()
        );
    }
}