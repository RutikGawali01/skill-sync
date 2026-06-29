package com.rutik.skill_sync_backend.match.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "match.weights")
@Getter
@Setter
public class MatchWeightProperties {
    private double skill = 40.0;
    private double trust = 20.0;
    private double rating = 15.0;
    private double availability = 10.0;
    private double experience = 10.0;
    private double activity = 5.0;
}
