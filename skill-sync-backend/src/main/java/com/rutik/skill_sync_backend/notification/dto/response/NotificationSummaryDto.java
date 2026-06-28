package com.rutik.skill_sync_backend.notification.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Lightweight DTO returned when the frontend establishes a connection or requests a summary.
 * It contains the count of unread notifications, a list of recent notifications, and the server time.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSummaryDto {
    private long unreadCount;
    private List<NotificationResponseDto> recentNotifications;
}
