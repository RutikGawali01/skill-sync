package com.rutik.skill_sync_backend.notification.service.impl;

import com.rutik.skill_sync_backend.common.constants.CacheNames;
import com.rutik.skill_sync_backend.notification.service.NotificationCacheHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationCacheHelperImpl implements NotificationCacheHelper {

    private final CacheManager cacheManager;

    @Override
    public void evictNotificationCache(Long userId) {
        log.info(" Programmatic Cache Eviction: Clearing notification and dashboard caches for userId = {}", userId);
        
        Cache notificationCache = cacheManager.getCache(CacheNames.NOTIFICATION_CACHE);
        if (notificationCache != null) {
            // Evict user-specific key variations
            notificationCache.evict("unread_count:" + userId);
            notificationCache.evict("notification_summary:" + userId);
            
            // To ensure page variations or unread lists (which are paged and dynamically key-generated) 
            // are cleared correctly, we clear the entire notificationCache.
            notificationCache.clear();
            log.info(" Cleared notificationCache");
        }

        Cache dashboardCache = cacheManager.getCache(CacheNames.DASHBOARD_CACHE);
        if (dashboardCache != null) {
            dashboardCache.evict("dashboard:" + userId);
            log.info(" Evicted dashboardCache for key: dashboard:{}", userId);
        }
    }
}
