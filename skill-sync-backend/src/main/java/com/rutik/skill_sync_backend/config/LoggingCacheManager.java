package com.rutik.skill_sync_backend.config;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Collection;

public class LoggingCacheManager implements CacheManager {

    private final CacheManager delegate;

    public LoggingCacheManager(CacheManager delegate) {
        this.delegate = delegate;
    }

    @Override
    public Cache getCache(String name) {
        Cache cache = delegate.getCache(name);
        return cache != null ? new LoggingCache(cache) : null;
    }

    @Override
    public Collection<String> getCacheNames() {
        return delegate.getCacheNames();
    }
}
