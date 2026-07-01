package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.enums.ReviewStatus;
import com.rutik.skill_sync_backend.review.enums.ReviewType;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class ReviewSeeder {

    private final ReviewRepository reviewRepository;
    private final Random random = new Random();

    private final String[] mentorComments = {
        "Excellent explanation. Very patient teacher.",
        "Great communication and very knowledgeable.",
        "Highly recommended. The practical examples were really helpful.",
        "Great session, though we could have paced it slightly faster.",
        "Very helpful. Looking forward to the next session!",
        "Very clear with concepts, helped me debug my issues quickly.",
        "Explain concepts clearly, with great coding examples.",
        "Highly recommended mentor. Explained all questions patiently.",
        "Great session on coding structure and architectural patterns."
    };

    @Transactional
    public void clear() {
        log.info("Deleting all reviews from repository...");
        reviewRepository.deleteAll();
    }

    @Transactional
    public void seed(List<Session> completedSessions) {
        if (reviewRepository.count() > 0) {
            log.info("Reviews already exist. Skipping review seeding.");
            return;
        }

        log.info("Generating Reviews for completed sessions...");
        List<Review> reviews = new ArrayList<>();

        for (Session session : completedSessions) {
            User learner = session.getRequester();
            User teacher = session.getProvider();

            // Generate exactly one review per completed session: learner reviews Teacher (MENTOR_REVIEW)
            int ratingForTeacher = getRandomRating();
            reviews.add(Review.builder()
                    .session(session)
                    .reviewer(learner)
                    .reviewee(teacher)
                    .overallRating(ratingForTeacher)
                    .teachingRating(ratingForTeacher)
                    .communicationRating(ratingForTeacher)
                    .punctualityRating(getRandomRating())
                    .knowledgeRating(ratingForTeacher)
                    .feedback(mentorComments[random.nextInt(mentorComments.length)])
                    .reviewType(ReviewType.MENTOR_REVIEW)
                    .status(ReviewStatus.VISIBLE)
                    .visible(true)
                    .moderated(false)
                    .createdAt(session.getEndTime().plusHours(random.nextInt(24) + 1))
                    .build());
        }

        reviewRepository.saveAll(reviews);
        log.info("Successfully seeded {} reviews.", reviews.size());
    }

    private int getRandomRating() {
        // Ratings between 3, 4, 5 (avoid all perfect ratings, meaning using 3, 4, 5)
        int r = random.nextInt(10);
        if (r < 4) {
            return 5; // 40% chance of 5 stars
        } else if (r < 8) {
            return 4; // 40% chance of 4 stars
        } else {
            return 3; // 20% chance of 3 stars
        }
    }
}
