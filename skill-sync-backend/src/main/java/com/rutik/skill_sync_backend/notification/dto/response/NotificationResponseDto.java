package com.rutik.skill_sync_backend.notification.dto.response;

import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;


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
