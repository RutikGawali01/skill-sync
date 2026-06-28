package com.rutik.skill_sync_backend.notification.websocket;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationSocketDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * WebSocket Gateway wrapping Spring STOMP's messaging template.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Provides a highly focused, low-level wrapper around SimpMessagingTemplate.
 * 2. Only communicates via point-to-point user-specific destinations.
 * 3. Never accesses the database or runs business logic.
 * 4. Log socket dispatches using SLF4J.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketGateway {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Pushes a specific notification payload to a single connected user.
     * Clients should subscribe to: /user/queue/notifications
     */
    public void sendNotification(String userId, NotificationSocketDto socketDto) {
        log.info("📡 WebSocket Outbound: Sending notification ID {} to user ID {}", socketDto.getId(), userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                socketDto
        );
    }

    /**
     * Pushes the latest unread badge count to a single connected user.
     * Clients should subscribe to: /user/queue/notifications/count
     */
    public void sendUnreadCount(String userId, long count) {
        log.info("📡 WebSocket Outbound: Sending unread badge count ({}) to user ID {}", count, userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications/count",
                count
        );
    }
}
