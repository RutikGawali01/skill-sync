package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service implementation for tracking real-time user online presence using an in-memory map.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceServiceImpl implements PresenceService {

    private final Map<Long, Boolean> onlineUsers = new ConcurrentHashMap<>();

    @Override
    public void handleUserConnect(Long userId) {
        log.info("User {} connected to WebSocket", userId);
        onlineUsers.put(userId, true);
    }

    @Override
    public void handleUserDisconnect(Long userId) {
        log.info("User {} disconnected from WebSocket", userId);
        onlineUsers.remove(userId);
    }

    @Override
    public boolean isUserOnline(Long userId) {
        return onlineUsers.getOrDefault(userId, false);
    }
}
