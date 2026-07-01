package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Orchestrator database seeder for development environment.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    
    private final SkillSeeder skillSeeder;
    private final UserSeeder userSeeder;
    private final UserSkillSeeder userSkillSeeder;
    private final AvailabilitySeeder availabilitySeeder;
    
    private final SessionSeeder sessionSeeder;
    private final ReviewSeeder reviewSeeder;
    private final TrustScoreSeeder trustScoreSeeder;
    private final ChatSeeder chatSeeder;
    private final NotificationSeeder notificationSeeder;

    @Value("${app.seed.enabled:true}")
    private boolean enabled;

    @Value("${app.seed.force:false}")
    private boolean force;

    @Override
    public void run(String... args) throws Exception {
        if (!enabled) {
            log.info("Database seeding is disabled (app.seed.enabled=false).");
            return;
        }

        log.info("========== DATABASE SEEDING START ==========");
        log.info("Force Seed Option: {}", force);

        // 1. Core Data (always keep and only seed if empty)
        boolean usersExisted = userRepository.count() > 0;
        List<User> users;
        if (!usersExisted) {
            log.info("Seeding core data (skills, users, user skills, availability)...");
            skillSeeder.seed();
            users = userSeeder.seed();
            userSkillSeeder.seed(users);
            availabilitySeeder.seed(users);
        } else {
            log.info("Core user data already exists. Fetching existing users...");
            users = userRepository.findAll();
        }

        // 2. Clear existing demo records in proper order if force seeding is requested
        if (force) {
            log.info("Force seed is enabled. Clearing existing demo feature data...");
            chatSeeder.clear();
            notificationSeeder.clear();
            reviewSeeder.clear();
            sessionSeeder.clear();
            log.info("Existing demo data successfully cleared.");
        }

        // 3. Seed feature demo data independently (each manages its own checks)
        List<Session> completedSessions = sessionSeeder.seed();
        reviewSeeder.seed(completedSessions);
        chatSeeder.seed();
        notificationSeeder.seed();
        trustScoreSeeder.seed(users);

        // 4. Seeding Status Report
        log.info("========== DATABASE SEEDING STATUS ==========");
        log.info(usersExisted ? "✓ Users already exist" : "✓ Users seeded");
        log.info("✓ Skills loaded");
        log.info(force ? "✓ Sessions recreated" : "✓ Sessions checked/seeded");
        log.info(force ? "✓ Reviews recreated" : "✓ Reviews checked/seeded");
        log.info(force ? "✓ Chat recreated" : "✓ Chat checked/seeded");
        log.info(force ? "✓ Notifications recreated" : "✓ Notifications checked/seeded");
        log.info("✓ Trust scores recalculated");
        log.info("============================================");
    }
}
