package com.rutik.skill_sync_backend.review.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewValidator {

    private final ReviewRepository reviewRepository;

    public void validateReviewCreation(
            Session session,
            User reviewer,
            User reviewee
    ) {

        validateSessionCompleted(session);

        validateParticipants(session, reviewer, reviewee);

        validateSelfReview(reviewer, reviewee);

        validateDuplicateReview(session, reviewer, reviewee);
    }

    private void validateSessionCompleted(Session session) {

        if (session.getStatus() != SessionStatus.COMPLETED) {

            throw new BadRequestException(
                    "Review can only be submitted for completed sessions"
            );
        }
    }

    private void validateParticipants(
            Session session,
            User reviewer,
            User reviewee
    ) {

        boolean isParticipant =
                session.getRequester().getId().equals(reviewer.getId())
                        || session.getProvider().getId().equals(reviewer.getId());

        if (!isParticipant) {

            throw new BadRequestException(
                    "Only session participants can submit reviews"
            );
        }
    }

    private void validateSelfReview(
            User reviewer,
            User reviewee
    ) {

        if (reviewer.getId().equals(reviewee.getId())) {

            throw new BadRequestException(
                    "Users cannot review themselves"
            );
        }
    }

    private void validateDuplicateReview(
            Session session,
            User reviewer,
            User reviewee
    ) {

        boolean exists =
                reviewRepository.existsBySessionAndReviewerAndReviewee(
                        session,
                        reviewer,
                        reviewee
                );

        if (exists) {

            throw new BadRequestException(
                    "Review already submitted"
            );
        }
    }
}
