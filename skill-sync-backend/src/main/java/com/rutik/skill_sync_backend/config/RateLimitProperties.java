package com.rutik.skill_sync_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.rate-limit")
@Getter
@Setter
public class RateLimitProperties {

    private boolean enabled = true;
    private List<RateLimitRule> rules = new ArrayList<>();

    @Getter
    @Setter
    public static class RateLimitRule {
        private String path;
        private int limit;
        private int windowSeconds = 60;
    }
}
