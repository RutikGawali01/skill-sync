package com.rutik.skill_sync_backend.notification.service.impl;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationSocketDto;
import com.rutik.skill_sync_backend.notification.mapper.NotificationMapper;
import com.rutik.skill_sync_backend.notification.service.NotificationPushService;
import com.rutik.skill_sync_backend.notification.websocket.NotificationWebSocketGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementation of NotificationPushService.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Only handles push delivery of notifications and badge counts.
 * 2. Absolutely no database dependencies (no repositories injected).
 * 3. Log pushes using SLF4J.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPushServiceImpl implements NotificationPushService {

    private final NotificationWebSocketGateway webSocketGateway;
    private final NotificationMapper notificationMapper;

    @Override
    public void pushNotification(Long userId, NotificationResponseDto dto) {
        if (userId == null || dto == null) {
            log.warn("⚠️ Cannot push notification: userId or payload is null");
            return;
        }
        log.info("🚀 Pushing notification ID {} to user ID {} via WebSocket", dto.getId(), userId);
        NotificationSocketDto socketDto = notificationMapper.toSocketDto(dto);
        webSocketGateway.sendNotification(userId.toString(), socketDto);
    }

    @Override
    public void pushUnreadCount(Long userId, long count) {
        if (userId == null) {
            log.warn("⚠️ Cannot push unread count: userId is null");
            return;
        }
        log.info("🚀 Pushing unread count ({}) to user ID {} via WebSocket", count, userId);
        webSocketGateway.sendUnreadCount(userId.toString(), count);
    }
}
