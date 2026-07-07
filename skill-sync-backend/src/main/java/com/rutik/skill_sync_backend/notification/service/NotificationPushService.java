package com.rutik.skill_sync_backend.notification.service;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;

public interface NotificationPushService {

    void pushNotification(Long userId, NotificationResponseDto dto);

    void pushUnreadCount(Long userId, long count);
}
