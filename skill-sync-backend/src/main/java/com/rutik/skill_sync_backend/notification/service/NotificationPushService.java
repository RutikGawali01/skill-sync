package com.rutik.skill_sync_backend.notification.service;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;

/**
 * Push Service Interface.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Pushing notifications or state updates (like unread counts) to connected clients.
 * 2. Absolutely NO database or repository interaction.
 * 3. Keeps real-time socket communications separated from business logic.
 */
public interface NotificationPushService {

    void pushNotification(Long userId, NotificationResponseDto dto);

    void pushUnreadCount(Long userId, long count);
}
