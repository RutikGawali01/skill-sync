package com.rutik.skill_sync_backend.session.repository;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
//queries - Conflict Logic detection
//existing.start < requested.end And  existing.end > requested.start
public interface SessionRepository extends JpaRepository<Session, Long> {

    // ==========================================
    // PROVIDER CONFLICT CHECK
    // ==========================================

    @Query("""
            SELECT s
            FROM Session s
            WHERE s.provider.id = :providerId
            AND s.status IN :statuses
            AND s.startTime < :endTime
            AND s.endTime > :startTime
            """)
    List<Session> findProviderConflictingSessions(
            @Param("providerId") Long providerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") List<SessionStatus> statuses
    );

    // ==========================================
    // REQUESTER CONFLICT CHECK
    // ==========================================

    @Query("""
            SELECT s
            FROM Session s
            WHERE s.requester.id = :requesterId
            AND s.status IN :statuses
            AND s.startTime < :endTime
            AND s.endTime > :startTime
            """)
    List<Session> findRequesterConflictingSessions(
            @Param("requesterId") Long requesterId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") List<SessionStatus> statuses
    );

    // ==========================================
    // DUPLICATE PENDING REQUEST CHECK
    // ==========================================

    boolean existsByRequesterIdAndProviderIdAndSkillIdAndStartTimeAndStatus(
            Long requesterId,
            Long providerId,
            Long skillId,
            LocalDateTime startTime,
            SessionStatus status
    );


    @Query("""
        SELECT s
        FROM Session s
        WHERE
        (
            s.requester.id = :userId
            OR
            s.provider.id = :userId
        )

        AND
        (
            :status IS NULL
            OR
            s.status = :status
        )

        AND
        (
            :upcoming IS NULL
            OR
            (
                :upcoming = true
                AND
                s.startTime > CURRENT_TIMESTAMP
            )
            OR
            (
                :upcoming = false
                AND
                s.startTime < CURRENT_TIMESTAMP
            )
        )

        ORDER BY s.startTime ASC
        """)
    Page<Session> findUserSessions(
            @Param("userId") Long userId,
            @Param("status") SessionStatus status,
            @Param("upcoming") Boolean upcoming,
            Pageable pageable
    );

    List<Session> findByStatusAndCreatedAtBefore(
            SessionStatus status,
            LocalDateTime time
    );

    @Query("""
        SELECT s
        FROM Session s
        JOIN FETCH s.requester
        JOIN FETCH s.provider
        JOIN FETCH s.skill
        WHERE s.id = :sessionId
        """)
    Optional<Session> findDetailedSessionById(
            @Param("sessionId") Long sessionId
    );
}