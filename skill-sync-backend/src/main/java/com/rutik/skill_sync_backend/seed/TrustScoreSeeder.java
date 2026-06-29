package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class TrustScoreSeeder {

    private final UserTrustScoreService trustScoreService;

    public void seed(List<User> users) {
        log.info("Calculating Trust Scores...");
        for (User user : users) {
            try {
                trustScoreService.calculateTrustScore(user);
            } catch (Exception e) {
                log.error("Failed to calculate trust score for user {}: {}", user.getId(), e.getMessage());
            }
        }
        log.info("Successfully updated trust scores for {} users.", users.size());
    }
}
