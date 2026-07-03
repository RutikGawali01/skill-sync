package com.rutik.skill_sync_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "app.cache")
@Getter
@Setter
public class RedisCacheProperties {

    /**
     * Default TTL in seconds (defaults to 600 seconds, which is 10 minutes)
     */
    private long defaultTtl = 600;

    /**
     * Specific TTL configurations for individual caches (in seconds)
     */
    private Map<String, Long> ttls = new HashMap<>();
}
