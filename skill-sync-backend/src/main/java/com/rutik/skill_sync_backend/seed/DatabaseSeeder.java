package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already contains user data. Skipping seeder execution.");
            return;
        }

        log.info("Starting database seeding process...");

        // 1. Predefined Skills
        skillSeeder.seed();

        // 2. Mock Users
        List<User> seededUsers = userSeeder.seed();

        // 3. User Skills (Offers / Wants with mutual matches)
        userSkillSeeder.seed(seededUsers);

        // 4. Availability
        availabilitySeeder.seed(seededUsers);

        // 5. Sessions
        List<Session> completedSessions = sessionSeeder.seed();

        // 6. Reviews
        reviewSeeder.seed(completedSessions);

        // 7. Trust Score Calculation
        trustScoreSeeder.seed(seededUsers);

        log.info("Database Seed Completed Successfully.");
    }
}
