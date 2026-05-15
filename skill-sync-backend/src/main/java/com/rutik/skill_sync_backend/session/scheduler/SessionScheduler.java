package com.rutik.skill_sync_backend.session.scheduler;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionScheduler {

    private final SessionRepository sessionRepository;

    // ==========================================
    // AUTO EXPIRE OLD PENDING SESSIONS
    // ==========================================

    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void expireOldPendingSessions() {

        log.info("Running session expiry scheduler");

        // ==========================================
        // FIND EXPIRED PENDING SESSIONS
        // ==========================================

        LocalDateTime expiryThreshold =
                LocalDateTime.now().minusHours(24);

        List<Session> expiredSessions =
                sessionRepository.findByStatusAndCreatedAtBefore(
                        SessionStatus.PENDING,
                        expiryThreshold
                );

        // ==========================================
        // UPDATE STATUS
        // ==========================================

        expiredSessions.forEach(session -> {

            session.setStatus(SessionStatus.EXPIRED);
        });

        // ==========================================
        // SAVE
        // ==========================================

        sessionRepository.saveAll(expiredSessions);

        log.info(
                "Expired {} pending sessions",
                expiredSessions.size()
        );
    }
}
