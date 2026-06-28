package com.rutik.skill_sync_backend.notification.mapper;

import com.rutik.skill_sync_backend.notification.entity.Notification;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationSocketDto;
import org.springframework.stereotype.Component;

/**
 * Mapper component for Notification entities.
 * Uses direct constructor mapping (no heavy reflection libraries like ModelMapper)
 * to maximize mapping performance and remain fully unit-testable.
 */
@Component
public class NotificationMapper {

    public NotificationResponseDto toResponseDto(Notification entity) {
        if (entity == null) {
            return null;
        }
        return NotificationResponseDto.builder()
                .id(entity.getId())
                .recipientId(entity.getRecipient() != null ? entity.getRecipient().getId() : null)
                .title(entity.getTitle())
                .message(entity.getMessage())
                .notificationType(entity.getNotificationType())
                .notificationPriority(entity.getNotificationPriority())
                .entityId(entity.getEntityId())
                .entityType(entity.getEntityType())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public NotificationSocketDto toSocketDto(Notification entity) {
        if (entity == null) {
            return null;
        }
        return NotificationSocketDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .notificationType(entity.getNotificationType())
                .notificationPriority(entity.getNotificationPriority())
                .entityId(entity.getEntityId())
                .entityType(entity.getEntityType())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public NotificationSocketDto toSocketDto(NotificationResponseDto responseDto) {
        if (responseDto == null) {
            return null;
        }
        return NotificationSocketDto.builder()
                .id(responseDto.getId())
                .title(responseDto.getTitle())
                .message(responseDto.getMessage())
                .notificationType(responseDto.getNotificationType())
                .notificationPriority(responseDto.getNotificationPriority())
                .entityId(responseDto.getEntityId())
                .entityType(responseDto.getEntityType())
                .isRead(responseDto.getIsRead())
                .createdAt(responseDto.getCreatedAt())
                .build();
    }
}
