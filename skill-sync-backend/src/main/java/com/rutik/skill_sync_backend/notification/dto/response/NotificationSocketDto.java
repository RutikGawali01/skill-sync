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
public class NotificationSocketDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private NotificationPriority notificationPriority;
    private Long entityId;
    private com.rutik.skill_sync_backend.notification.enums.NotificationEntityType entityType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
