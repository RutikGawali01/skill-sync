package com.rutik.skill_sync_backend.notification.service;

public interface NotificationCacheHelper {

    void evictNotificationCache(Long userId);
}
