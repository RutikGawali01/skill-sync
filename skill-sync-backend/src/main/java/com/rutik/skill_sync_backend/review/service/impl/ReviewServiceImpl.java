package com.rutik.skill_sync_backend.review.service.impl;

import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.review.dto.request.CreateReviewRequestDto;
import com.rutik.skill_sync_backend.review.dto.response.ReviewResponseDto;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.enums.ReviewStatus;
import com.rutik.skill_sync_backend.review.enums.ReviewType;
import com.rutik.skill_sync_backend.review.event.ReviewSubmittedEvent;
import com.rutik.skill_sync_backend.review.mapper.ReviewMapper;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.review.service.interfaces.ReviewService;
import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import com.rutik.skill_sync_backend.review.validator.ReviewValidator;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    // ==========================================
    // REPOSITORIES
    // ==========================================

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final SessionRepository sessionRepository;

    // ==========================================
    // VALIDATOR
    // ==========================================

    private final ReviewValidator reviewValidator;

    // ==========================================
    // EVENT PUBLISHER
    // ==========================================

    private final ApplicationEventPublisher eventPublisher;

    // ==========================================
    // CREATE REVIEW
    // ==========================================

    @Override
    @Transactional
    public ReviewResponseDto createReview(
            Long reviewerId,
            CreateReviewRequestDto requestDto
    ) {

        log.info(
                "Creating review for sessionId={} by reviewerId={}",
                requestDto.getSessionId(),
                reviewerId
        );

        // ==========================================
        // FETCH ENTITIES
        // ==========================================

        User reviewer = getUserById(reviewerId);

        User reviewee = getUserById(
                requestDto.getRevieweeId()
        );

        Session session = getSessionById(
                requestDto.getSessionId()
        );

        // ==========================================
        // VALIDATE REVIEW CREATION
        // ==========================================

        reviewValidator.validateReviewCreation(
                session,
                reviewer,
                reviewee
        );

        // ==========================================
        // BUILD REVIEW ENTITY
        // ==========================================

        Review review = buildReview(
                reviewer,
                reviewee,
                session,
                requestDto
        );

        // ==========================================
        // SAVE REVIEW
        // ==========================================

        Review savedReview =
                reviewRepository.save(review);

        // ==========================================
        // PUBLISH EVENT
        // ==========================================

        publishReviewSubmittedEvent(savedReview);

        log.info(
                "Review created successfully with id={}",
                savedReview.getId()
        );

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return ReviewMapper.toDto(savedReview);
    }

    // ==========================================
    // GET USER REVIEWS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByUser(
            Long userId
    ) {

        log.info(
                "Fetching reviews for userId={}",
                userId
        );

        User reviewee = getUserById(userId);

        return reviewRepository.findByReviewee(reviewee)
                .stream()
                .map(ReviewMapper::toDto)
                .toList();
    }

    // ==========================================
    // GET SESSION REVIEWS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsBySession(
            Long sessionId
    ) {

        log.info(
                "Fetching reviews for sessionId={}",
                sessionId
        );

        Session session = getSessionById(sessionId);

        return reviewRepository.findBySession(session)
                .stream()
                .map(ReviewMapper::toDto)
                .toList();
    }

    // ==========================================
    // PRIVATE METHODS
    // ==========================================

    private User getUserById(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );
    }

    private Session getSessionById(Long sessionId) {

        return sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Session not found with id: " + sessionId
                        )
                );
    }

    private Review buildReview(
            User reviewer,
            User reviewee,
            Session session,
            CreateReviewRequestDto requestDto
    ) {

        return Review.builder()

                // ==========================================
                // RELATIONS
                // ==========================================

                .reviewer(reviewer)

                .reviewee(reviewee)

                .session(session)

                // ==========================================
                // RATINGS
                // ==========================================

                .overallRating(
                        requestDto.getOverallRating()
                )

                .teachingRating(
                        requestDto.getTeachingRating()
                )

                .communicationRating(
                        requestDto.getCommunicationRating()
                )

                .punctualityRating(
                        requestDto.getPunctualityRating()
                )

                .knowledgeRating(
                        requestDto.getKnowledgeRating()
                )

                // ==========================================
                // REVIEW CONTENT
                // ==========================================

                .feedback(
                        requestDto.getFeedback()
                )

                // ==========================================
                // REVIEW TYPE
                // ==========================================

                .reviewType(
                        determineReviewType(
                                session,
                                reviewer
                        )
                )

                // ==========================================
                // MODERATION
                // ==========================================

                .status(ReviewStatus.VISIBLE)

                .visible(true)

                .moderated(false)

                .build();
    }

    private ReviewType determineReviewType(
            Session session,
            User reviewer
    ) {

        boolean isRequester =
                session.getRequester()
                        .getId()
                        .equals(reviewer.getId());

        if (isRequester) {

            return ReviewType.MENTOR_REVIEW;
        }

        return ReviewType.LEARNER_REVIEW;
    }

    private void publishReviewSubmittedEvent(
            Review review
    ) {

        ReviewSubmittedEvent event =
                ReviewSubmittedEvent.builder()

                        .reviewId(
                                review.getId()
                        )

                        .reviewerId(
                                review.getReviewer().getId()
                        )

                        .revieweeId(
                                review.getReviewee().getId()
                        )

                        .sessionId(
                                review.getSession().getId()
                        )

                        .overallRating(
                                review.getOverallRating()
                        )

                        .build();

        eventPublisher.publishEvent(event);

        log.info(
                "Published ReviewSubmittedEvent for reviewId={}",
                review.getId()
        );
    }
}