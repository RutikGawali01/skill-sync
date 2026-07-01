package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.match.entity.Match;
import com.rutik.skill_sync_backend.match.repository.MatchRepository;
import com.rutik.skill_sync_backend.notification.entity.Notification;
import com.rutik.skill_sync_backend.notification.enums.NotificationEntityType;
import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.notification.repository.NotificationRepository;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
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
public class NotificationSeeder {

    private final NotificationRepository notificationRepository;
    private final SessionRepository sessionRepository;
    private final MatchRepository matchRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    @Transactional
    public void clear() {
        log.info("Deleting all notifications from repository...");
        notificationRepository.deleteAll();
    }

    @Transactional
    public void seed() {
        if (notificationRepository.count() > 0) {
            log.info("Notifications already exist. Skipping notification seeding.");
            return;
        }

        log.info("Seeding Notifications...");
        List<Notification> notifications = new ArrayList<>();

        // 1. MATCH_FOUND Notifications
        List<Match> matches = matchRepository.findAll();
        for (Match match : matches) {
            // User A notification
            notifications.add(Notification.builder()
                    .recipient(match.getUserA())
                    .title("New Match Found!")
                    .message("You matched with " + match.getUserB().getName() + " for a skill exchange!")
                    .notificationType(NotificationType.MATCH_FOUND)
                    .notificationPriority(NotificationPriority.NORMAL)
                    .entityId(match.getId())
                    .entityType(NotificationEntityType.MATCH)
                    .isRead(random.nextBoolean()) // Randomize read status
                    .isDeleted(false)
                    .createdAt(match.getCreatedAt())
                    .build());

            // User B notification
            notifications.add(Notification.builder()
                    .recipient(match.getUserB())
                    .title("New Match Found!")
                    .message("You matched with " + match.getUserA().getName() + " for a skill exchange!")
                    .notificationType(NotificationType.MATCH_FOUND)
                    .notificationPriority(NotificationPriority.NORMAL)
                    .entityId(match.getId())
                    .entityType(NotificationEntityType.MATCH)
                    .isRead(random.nextBoolean())
                    .isDeleted(false)
                    .createdAt(match.getCreatedAt())
                    .build());
        }

        // 2. Session Lifecycle Notifications
        List<Session> sessions = sessionRepository.findAll();
        for (Session session : sessions) {
            User learner = session.getRequester();
            User teacher = session.getProvider();

            if (session.getStatus() == SessionStatus.PENDING) {
                // Request sent to teacher
                notifications.add(Notification.builder()
                        .recipient(teacher)
                        .title("Session Request Received")
                        .message(learner.getName() + " wants to book a session on " + session.getSkill().getName() + ".")
                        .notificationType(NotificationType.SESSION_REQUEST)
                        .notificationPriority(NotificationPriority.HIGH)
                        .entityId(session.getId())
                        .entityType(NotificationEntityType.SESSION)
                        .isRead(false) // Pending requests should usually be unread
                        .isDeleted(false)
                        .createdAt(session.getCreatedAt())
                        .build());
            } else if (session.getStatus() == SessionStatus.ACCEPTED) {
                // Acceptance sent to learner
                notifications.add(Notification.builder()
                        .recipient(learner)
                        .title("Session Request Accepted!")
                        .message(teacher.getName() + " accepted your session request on " + session.getSkill().getName() + ".")
                        .notificationType(NotificationType.SESSION_ACCEPTED)
                        .notificationPriority(NotificationPriority.HIGH)
                        .entityId(session.getId())
                        .entityType(NotificationEntityType.SESSION)
                        .isRead(random.nextBoolean())
                        .isDeleted(false)
                        .createdAt(session.getAcceptedAt() != null ? session.getAcceptedAt() : session.getCreatedAt().plusDays(1))
                        .build());
            } else if (session.getStatus() == SessionStatus.COMPLETED) {
                // Completion reminders or review prompts
                notifications.add(Notification.builder()
                        .recipient(learner)
                        .title("Session Completed")
                        .message("Your session with " + teacher.getName() + " is completed. Please leave a review.")
                        .notificationType(NotificationType.SESSION_COMPLETED)
                        .notificationPriority(NotificationPriority.NORMAL)
                        .entityId(session.getId())
                        .entityType(NotificationEntityType.SESSION)
                        .isRead(true)
                        .isDeleted(false)
                        .createdAt(session.getCompletedAt() != null ? session.getCompletedAt() : session.getStartTime().plusHours(2))
                        .build());
            } else if (session.getStatus() == SessionStatus.CANCELLED) {
                // Cancellation notification
                User recipient = random.nextBoolean() ? learner : teacher;
                notifications.add(Notification.builder()
                        .recipient(recipient)
                        .title("Session Cancelled")
                        .message("The session on " + session.getSkill().getName() + " has been cancelled.")
                        .notificationType(NotificationType.SESSION_CANCELLED)
                        .notificationPriority(NotificationPriority.HIGH)
                        .entityId(session.getId())
                        .entityType(NotificationEntityType.SESSION)
                        .isRead(true)
                        .isDeleted(false)
                        .createdAt(session.getCancelledAt() != null ? session.getCancelledAt() : session.getStartTime().minusDays(1))
                        .build());
            }
        }

        // 3. Review RECEIVED Notifications
        List<Review> reviews = reviewRepository.findAll();
        for (Review review : reviews) {
            notifications.add(Notification.builder()
                    .recipient(review.getReviewee())
                    .title("New Review Received")
                    .message(review.getReviewer().getName() + " gave you a " + review.getOverallRating() + "-star review.")
                    .notificationType(NotificationType.REVIEW_RECEIVED)
                    .notificationPriority(NotificationPriority.NORMAL)
                    .entityId(review.getId())
                    .entityType(NotificationEntityType.REVIEW)
                    .isRead(random.nextBoolean())
                    .isDeleted(false)
                    .createdAt(review.getCreatedAt())
                    .build());
        }

        notificationRepository.saveAll(notifications);
        log.info("Successfully seeded {} notifications.", notifications.size());
    }
}
