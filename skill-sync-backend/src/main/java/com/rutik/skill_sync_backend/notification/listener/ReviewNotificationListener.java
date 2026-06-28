package com.rutik.skill_sync_backend.notification.listener;

import com.rutik.skill_sync_backend.notification.service.NotificationService;
import com.rutik.skill_sync_backend.review.event.ReviewSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Domain Event Listener for review-related events.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Listens to ReviewSubmittedEvent.
 * 2. Unpacks the event and delegates business orchestration to NotificationService.
 * 3. Asynchronous execution (@Async) prevents blocking the primary HTTP request thread.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleReviewSubmitted(ReviewSubmittedEvent event) {
        log.info("📥 Domain Event Received: ReviewSubmittedEvent for review ID {}", event.getReviewId());
        try {
            notificationService.notifyReviewReceived(
                    event.getRevieweeId(), // Recipient who received the review
                    event.getReviewerId(), // User who wrote the review
                    event.getReviewId(),
                    event.getSessionId(),
                    event.getOverallRating()
            );
            log.info("✅ Successfully processed ReviewSubmittedEvent for review ID {}", event.getReviewId());
        } catch (Exception ex) {
            log.error("❌ Error processing ReviewSubmittedEvent: {}", ex.getMessage(), ex);
        }
    }
}
