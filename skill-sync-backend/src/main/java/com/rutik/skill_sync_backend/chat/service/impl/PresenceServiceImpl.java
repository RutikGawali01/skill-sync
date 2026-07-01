package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import com.rutik.skill_sync_backend.chat.event.UserOnlineEvent;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service implementation for tracking real-time user online presence using an in-memory map.
 * Supports multiple tabs/devices per user using connection counting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceServiceImpl implements PresenceService {

    private final Map<Long, Integer> onlineUsers = new ConcurrentHashMap<>();
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void handleUserConnect(Long userId) {
        log.info("User {} connected to WebSocket", userId);
        boolean becameOnline = false;
        synchronized (onlineUsers) {
            int count = onlineUsers.getOrDefault(userId, 0);
            onlineUsers.put(userId, count + 1);
            if (count == 0) {
                becameOnline = true;
            }
        }
        if (becameOnline) {
            log.info("User {} is now ONLINE (first connection)", userId);
            broadcastPresence(userId, "ONLINE");
            eventPublisher.publishEvent(new UserOnlineEvent(userId));
        }
    }

    @Override
    public void handleUserDisconnect(Long userId) {
        log.info("User {} disconnected from WebSocket", userId);
        boolean becameOffline = false;
        synchronized (onlineUsers) {
            Integer count = onlineUsers.get(userId);
            if (count != null) {
                if (count <= 1) {
                    onlineUsers.remove(userId);
                    becameOffline = true;
                } else {
                    onlineUsers.put(userId, count - 1);
                }
            }
        }
        if (becameOffline) {
            log.info("User {} is now OFFLINE (last connection closed)", userId);
            broadcastPresence(userId, "OFFLINE");
        }
    }

    @Override
    public boolean isUserOnline(Long userId) {
        return onlineUsers.containsKey(userId);
    }

    private void broadcastPresence(Long userId, String status) {
        try {
            List<Long> conversationIds = conversationParticipantRepository.findConversationIdsByUserId(userId);
            for (Long cid : conversationIds) {
                List<ConversationParticipant> participants = conversationParticipantRepository.findByConversationIdAndDeletedFalse(cid);
                for (ConversationParticipant cp : participants) {
                    if (!cp.getUser().getId().equals(userId)) {
                        Map<String, Object> presenceUpdate = new HashMap<>();
                        presenceUpdate.put("userId", userId);
                        presenceUpdate.put("status", status);
                        
                        log.debug("Sending presence event {} of user {} to user {}", status, userId, cp.getUser().getId());
                        simpMessagingTemplate.convertAndSendToUser(
                                cp.getUser().getId().toString(),
                                "/queue/chat/presence",
                                presenceUpdate
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to broadcast presence update for user {}: {}", userId, e.getMessage(), e);
        }
    }
}
