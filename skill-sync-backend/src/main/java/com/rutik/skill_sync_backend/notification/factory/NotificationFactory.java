package com.rutik.skill_sync_backend.notification.factory;

import com.rutik.skill_sync_backend.notification.entity.Notification;
import com.rutik.skill_sync_backend.notification.enums.NotificationEntityType;
import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.stereotype.Component;

/**
 * Factory class responsible ONLY for constructing Notification entities.
 * Decoupled from title/message formatting copy and business rules.
 */
@Component
public class NotificationFactory {

    public Notification buildNotification(
            User recipient,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            Long entityId,
            NotificationEntityType entityType) {

        return Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .notificationType(type)
                .notificationPriority(priority)
                .entityId(entityId)
                .entityType(entityType)
                .isRead(false)
                .isDeleted(false)
                .build();
    }
}
