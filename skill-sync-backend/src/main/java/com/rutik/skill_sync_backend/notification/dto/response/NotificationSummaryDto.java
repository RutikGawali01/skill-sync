package com.rutik.skill_sync_backend.notification.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSummaryDto {
    private long unreadCount;
    private List<NotificationResponseDto> recentNotifications;
}
