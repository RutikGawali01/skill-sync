package com.rutik.skill_sync_backend.notification.websocket;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationSocketDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketGateway {

    private final SimpMessagingTemplate messagingTemplate;


    public void sendNotification(String userId, NotificationSocketDto socketDto) {
        log.info("📡 WebSocket Outbound: Sending notification ID {} to user ID {}", socketDto.getId(), userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                socketDto
        );
    }


    public void sendUnreadCount(String userId, long count) {
        log.info("📡 WebSocket Outbound: Sending unread badge count ({}) to user ID {}", count, userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications/count",
                count
        );
    }
}
