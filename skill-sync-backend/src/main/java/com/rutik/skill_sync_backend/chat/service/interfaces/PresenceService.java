package com.rutik.skill_sync_backend.chat.service.interfaces;

/**
 * Service interface for tracking real-time user online presence.
 */
public interface PresenceService {

    /**
     * Handles presence state when a user connects.
     *
     * @param userId the user ID
     */
    void handleUserConnect(Long userId);

    /**
     * Handles presence state when a user disconnects.
     *
     * @param userId the user ID
     */
    void handleUserDisconnect(Long userId);

    /**
     * Checks if a user is online.
     *
     * @param userId the user ID
     * @return true if the user is online, false otherwise
     */
    boolean isUserOnline(Long userId);
}
