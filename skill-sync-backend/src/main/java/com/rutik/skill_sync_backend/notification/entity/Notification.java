package com.rutik.skill_sync_backend.notification.entity;

import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Persistent notification record.
 *
 * Design Decisions:
 * ─────────────────
 * 1. recipient is LAZY to avoid loading the full User graph on every
 *    notification query — we only ever need recipient.id for ownership checks.
 *
 * 2. notificationType and notificationPriority are stored as STRING to keep
 *    the DB readable and allow schema-free enum additions without a migration.
 *
 * 3. entityId + entityType enable deep-linking ("go to this session/review")
 *    without embedding the target entity directly.
 *
 * 4. redirectUrl is pre-computed at creation time by NotificationFactory so
 *    the client never needs to build URLs itself.
 *
 * 5. isDeleted = soft delete. Notifications are never hard-deleted from the DB
 *    (important for audit + analytics). Repository queries always filter
 *    isDeleted = false.
 *
 * 6. Three composite indexes cover the three most frequent access patterns:
 *    a) recipient feed (recipient_id, is_deleted, created_at DESC)
 *    b) unread count   (recipient_id, is_read, is_deleted)
 *    c) recent lookup  (created_at DESC)
 *
 * Scalability: For very high-volume systems, partition this table by
 * recipient_id or move to a dedicated notification service with Cassandra.
 */
@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_recipient",
                        columnList = "recipient_id"),
                @Index(name = "idx_notification_recipient_read",
                        columnList = "recipient_id, is_read, is_deleted"),
                @Index(name = "idx_notification_created_at",
                        columnList = "created_at DESC")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Ownership ──────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // ── Content ────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority notificationPriority;

    // ── Deep-link context ──────────────────────────────────────────────────
    private Long entityId;          // e.g. reviewId, sessionId

    @Enumerated(EnumType.STRING)
    private com.rutik.skill_sync_backend.notification.enums.NotificationEntityType entityType; // e.g. REVIEW, SESSION

    // ── State ──────────────────────────────────────────────────────────────
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // ── Audit ──────────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}