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
        "Very clear with concepts, helped me debug my issues quickly."
    };

    private final String[] learnerComments = {
        "Great student. Eager to learn and asked good questions.",
        "Very interactive and prepared for the session.",
        "Nice experience teaching them. They grasped the concepts quickly.",
        "Good listener and very punctual.",
        "Great communication. Fantastic student.",
        "Very enthusiastic and completed the exercises on time."
    };

    @Transactional
    public void seed(List<Session> completedSessions) {
//        if (reviewRepository.count() > 0) {
//            log.info("Reviews already exist. Skipping review seeding.");
//            return;
//        }

        log.info("Generating Reviews...");
        List<Review> reviews = new ArrayList<>();

        for (Session session : completedSessions) {
            User learner = session.getRequester();
            User teacher = session.getProvider();

            // 1. Learner reviews Teacher (MENTOR_REVIEW)
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
                    .build());

            // 2. Teacher reviews Learner (LEARNER_REVIEW)
            int ratingForLearner = getRandomRating();
            reviews.add(Review.builder()
                    .session(session)
                    .reviewer(teacher)
                    .reviewee(learner)
                    .overallRating(ratingForLearner)
                    .teachingRating(ratingForLearner)
                    .communicationRating(ratingForLearner)
                    .punctualityRating(getRandomRating())
                    .knowledgeRating(ratingForLearner)
                    .feedback(learnerComments[random.nextInt(learnerComments.length)])
                    .reviewType(ReviewType.LEARNER_REVIEW)
                    .status(ReviewStatus.VISIBLE)
                    .visible(true)
                    .moderated(false)
                    .build());
        }

        reviewRepository.saveAll(reviews);
        log.info("Successfully seeded {} reviews.", reviews.size());
    }

    private int getRandomRating() {
        int r = random.nextInt(10);
        if (r < 7) {
            return 5; // 70% chance of 5 stars
        } else if (r < 9) {
            return 4; // 20% chance of 4 stars
        } else {
            return 3; // 10% chance of 3 stars
        }
    }
}
