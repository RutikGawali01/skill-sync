package com.rutik.skill_sync_backend.notification.service;

public interface NotificationCacheHelper {
    /**
     * Programmatically evict/clear all notification and dashboard cache entries for a specific user.
     * Used upon creating, updating, or deleting notifications.
     */
    void evictNotificationCache(Long userId);
}
