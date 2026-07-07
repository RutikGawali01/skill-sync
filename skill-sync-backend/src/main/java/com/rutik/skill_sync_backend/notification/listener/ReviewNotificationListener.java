package com.rutik.skill_sync_backend.notification.listener;

import com.rutik.skill_sync_backend.notification.service.NotificationService;
import com.rutik.skill_sync_backend.review.event.ReviewSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;


@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewNotificationListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewSubmitted(ReviewSubmittedEvent event) {
        log.info(" [AFTER_COMMIT] ReviewSubmittedEvent for review ID {}", event.getReviewId());
        try {
            notificationService.notifyReviewReceived(
                    event.getRevieweeId(), // Recipient: the user who received the review
                    event.getReviewerId(), // Actor: the user who wrote the review
                    event.getReviewId(),
                    event.getSessionId(),
                    event.getOverallRating()
            );
            log.info(" Processed ReviewSubmittedEvent for review ID {}", event.getReviewId());
        } catch (Exception ex) {
            log.error(" Error processing ReviewSubmittedEvent for review {}: {}",
                    event.getReviewId(), ex.getMessage(), ex);
        }
    }
}
