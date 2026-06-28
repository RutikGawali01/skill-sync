package com.rutik.skill_sync_backend.notification.dto.response;

import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Full notification DTO returned through REST APIs.
 *
 * This is the canonical response DTO for:
 *   GET /api/notifications
 *   GET /api/notifications/unread-count (embedded in NotificationSummaryDto)
 *
 * Design: We expose all fields the client needs to render the notification
 * and deep-link to the referenced entity. The entity itself is never exposed.
 *
 * redirectUrl is pre-computed server-side so the client does zero URL logic.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {

    private Long id;

    private Long recipientId;

    private String title;

    private String message;

    private NotificationType notificationType;

    private NotificationPriority notificationPriority;

    // Deep-link context
    private Long entityId;
    private com.rutik.skill_sync_backend.notification.enums.NotificationEntityType entityType;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
