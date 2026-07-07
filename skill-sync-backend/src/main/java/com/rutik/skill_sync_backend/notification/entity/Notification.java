package com.rutik.skill_sync_backend.notification.entity;

import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

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

    private Long entityId;          // e.g. reviewId, sessionId

    @Enumerated(EnumType.STRING)
    private com.rutik.skill_sync_backend.notification.enums.NotificationEntityType entityType; // e.g. REVIEW, SESSION

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;


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