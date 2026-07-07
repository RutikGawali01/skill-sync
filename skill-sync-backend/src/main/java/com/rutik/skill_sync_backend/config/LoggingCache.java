package com.rutik.skill_sync_backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;

import java.util.concurrent.Callable;

@Slf4j
public class LoggingCache implements Cache {

    private final Cache delegate;

    public LoggingCache(Cache delegate) {
        this.delegate = delegate;
    }

    @Override
    public String getName() {
        return delegate.getName();
    }

    @Override
    public Object getNativeCache() {
        return delegate.getNativeCache();
    }

    @Override
    public ValueWrapper get(Object key) {
        ValueWrapper wrapper = delegate.get(key);
        if (wrapper != null) {
            log.info(" CACHE HIT - Cache: '{}', Key: '{}'", getName(), key);
        } else {
            log.info("CACHE MISS - Cache: '{}', Key: '{}'", getName(), key);
        }
        return wrapper;
    }

    @Override
    public <T> T get(Object key, Class<T> type) {
        T value = delegate.get(key, type);
        if (value != null) {
            log.info("CACHE HIT - Cache: '{}', Key: '{}'", getName(), key);
        } else {
            log.info(" CACHE MISS - Cache: '{}', Key: '{}'", getName(), key);
        }
        return value;
    }

    @Override
    public <T> T get(Object key, Callable<T> valueLoader) {
        // Value loader is typically used for sync cache loading (e.g. get with fallback)
        log.info("CACHE GET (with Loader) - Cache: '{}', Key: '{}'", getName(), key);
        return delegate.get(key, valueLoader);
    }

    @Override
    public void put(Object key, Object value) {
        log.info("CACHE PUT - Cache: '{}', Key: '{}'", getName(), key);
        delegate.put(key, value);
    }

    @Override
    public void evict(Object key) {
        log.info(" CACHE EVICT - Cache: '{}', Key: '{}'", getName(), key);
        delegate.evict(key);
    }

    @Override
    public void clear() {
        log.info(" CACHE CLEAR - Cache: '{}'", getName());
        delegate.clear();
    }
}
