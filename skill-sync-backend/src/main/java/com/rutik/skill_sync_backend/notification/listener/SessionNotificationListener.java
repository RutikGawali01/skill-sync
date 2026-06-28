package com.rutik.skill_sync_backend.notification.listener;

import com.rutik.skill_sync_backend.notification.service.NotificationService;
import com.rutik.skill_sync_backend.session.event.SessionAcceptedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCompletedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Domain Event Listener for session-related events.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Listens to SessionAcceptedEvent, SessionCompletedEvent, and SessionCancelledEvent.
 * 2. Unpacks the event and delegates business orchestration to NotificationService.
 * 3. Asynchronous execution (@Async) prevents blocking the primary HTTP request thread.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleSessionAccepted(SessionAcceptedEvent event) {
        log.info("📥 Domain Event Received: SessionAcceptedEvent for session ID {}", event.getSessionId());
        try {
            notificationService.notifySessionAccepted(
                    event.getRequesterId(), // Recipient who gets notified (the learner)
                    event.getProviderId(),  // The teacher who accepted
                    event.getSessionId(),
                    event.getSkillName()
            );
            log.info("✅ Successfully processed SessionAcceptedEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionAcceptedEvent: {}", ex.getMessage(), ex);
        }
    }

    @EventListener
    public void handleSessionCompleted(SessionCompletedEvent event) {
        log.info("📥 Domain Event Received: SessionCompletedEvent for session ID {}", event.getSessionId());
        try {
            // Notify the requester that the session is completed
            notificationService.notifySessionCompleted(
                    event.getRequesterId(),
                    event.getProviderId(),
                    event.getSessionId(),
                    event.getSkillName()
            );
            
            // Optionally, also notify the provider
            notificationService.notifySessionCompleted(
                    event.getProviderId(),
                    event.getRequesterId(),
                    event.getSessionId(),
                    event.getSkillName()
            );
            log.info("✅ Successfully processed SessionCompletedEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionCompletedEvent: {}", ex.getMessage(), ex);
        }
    }

    @EventListener
    public void handleSessionCancelled(SessionCancelledEvent event) {
        log.info("📥 Domain Event Received: SessionCancelledEvent for session ID {}", event.getSessionId());
        try {
            notificationService.notifySessionCancelled(
                    event.getOtherPartyId(), // Recipient who gets notified (the other party)
                    event.getCancelledById(), // The user who initiated the cancellation
                    event.getSessionId(),
                    event.getSkillName(),
                    event.getReason()
            );
            log.info("✅ Successfully processed SessionCancelledEvent for session ID {}", event.getSessionId());
        } catch (Exception ex) {
            log.error("❌ Error processing SessionCancelledEvent: {}", ex.getMessage(), ex);
        }
    }
}
