package com.rutik.skill_sync_backend.session.entity;

import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import jakarta.persistence.*;
        import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sessions",
        indexes = {

                // 🔥 Conflict detection indexes
                @Index(
                        name = "idx_provider_start_time",
                        columnList = "provider_id,start_time"
                ),

                @Index(
                        name = "idx_requester_start_time",
                        columnList = "requester_id,start_time"
                ),

                // 🔥 Fast filtering
                @Index(
                        name = "idx_session_status",
                        columnList = "status"
                ),

                @Index(
                        name = "idx_session_skill",
                        columnList = "skill_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // SESSION PARTICIPANTS
    // ==========================================

    // User requesting learning
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    // User providing teaching
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    // ==========================================
    // SKILL INFORMATION
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // ==========================================
    // SESSION TIMING
    // ==========================================

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // ==========================================
    // SESSION STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionMode mode;

    // ==========================================
    // SESSION DETAILS
    // ==========================================

    @Column(length = 1000)
    private String message;

    // Optional meeting link
    private String meetingLink;

    // Optional notes
    @Column(length = 2000)
    private String notes;

    // ==========================================
    // REJECTION / CANCELLATION
    // ==========================================

    @Column(length = 500)
    private String rejectionReason;

    @Column(length = 500)
    private String cancellationReason;

    // ==========================================
    // SESSION TRACKING
    // ==========================================

    private LocalDateTime acceptedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime cancelledAt;

    private LocalDateTime completedAt;

    // ==========================================
    // AUDIT FIELDS
    // ==========================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ==========================================
    // AUTO TIMESTAMPS
    // ==========================================

    @PrePersist
    public void onCreate() {

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        // Default session status
        if (this.status == null) {
            this.status = SessionStatus.PENDING;
        }
    }

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }
}