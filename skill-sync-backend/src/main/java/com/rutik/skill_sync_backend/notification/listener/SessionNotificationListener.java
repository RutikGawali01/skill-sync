package com.rutik.skill_sync_backend.notification.listener;

import com.rutik.skill_sync_backend.notification.service.NotificationService;
import com.rutik.skill_sync_backend.session.event.SessionAcceptedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCompletedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Domain Event Listener for session-related notifications.
 *
 * Critical design decisions:
 * ──────────────────────────
 * 1. @TransactionalEventListener(phase = AFTER_COMMIT)
 *    Events are fired ONLY after the parent transaction commits successfully.
 *    This prevents phantom notifications for sessions that never persisted.
 *    Previously @EventListener fired inside the active transaction — the
 *    WebSocket push ran before the DB row was committed.
 *
 * 2. @Async
 *    Notification creation + WebSocket push run in a separate thread pool.
 *    This prevents blocking the HTTP response thread and avoids inheriting
 *    the parent transaction context (which would cause LazyInitializationException
 *    when accessing LAZY-loaded associations inside the notification service).
 *    Requires @EnableAsync on the main application class.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionNotificationListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSessionAccepted(SessionAcceptedEvent event) {
        log.info("📥 [AFTER_COMMIT] SessionAcceptedEvent for session ID {}", event.getSessionId());
        try {
            notificationService.notifySessionAccepted(
                    event.getRequesterId(), // Recipient: the learner who made the request
                    event.getProviderId(),  // Actor: the teacher who accepted
                    event.getSessionId(),
                    event.getSkillName()
            );
            log.info("✅ Processed SessionAcceptedEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionAcceptedEvent for session {}: {}",
                    event.getSessionId(), ex.getMessage(), ex);
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSessionCompleted(SessionCompletedEvent event) {
        log.info("📥 [AFTER_COMMIT] SessionCompletedEvent for session ID {}", event.getSessionId());
        try {
            // Notify the requester (learner)
            notificationService.notifySessionCompleted(
                    event.getRequesterId(),
                    event.getProviderId(),
                    event.getSessionId(),
                    event.getSkillName()
            );
            // Notify the provider (teacher)
            notificationService.notifySessionCompleted(
                    event.getProviderId(),
                    event.getRequesterId(),
                    event.getSessionId(),
                    event.getSkillName()
            );
            log.info("✅ Processed SessionCompletedEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionCompletedEvent for session {}: {}",
                    event.getSessionId(), ex.getMessage(), ex);
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSessionCancelled(SessionCancelledEvent event) {
        log.info("📥 [AFTER_COMMIT] SessionCancelledEvent for session ID {}", event.getSessionId());
        try {
            notificationService.notifySessionCancelled(
                    event.getOtherPartyId(),   // Recipient: the other party
                    event.getCancelledById(),  // Actor: who cancelled
                    event.getSessionId(),
                    event.getSkillName(),
                    event.getReason()
            );
            log.info("✅ Processed SessionCancelledEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionCancelledEvent for session {}: {}",
                    event.getSessionId(), ex.getMessage(), ex);
        }
    }
}
