package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.enums.*;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class UserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public List<User> seed() {
//        if (userRepository.count() > 0) {
//            log.info("Users already exist. Skipping user seeding.");
//            return userRepository.findAll();
//        }

        log.info("Creating Users...");
        Faker faker = new Faker();
        List<User> users = new ArrayList<>();
        String encodedPassword = passwordEncoder.encode("Password123");

        // Predefined list of 25 users with specific names for realistic profiles
        String[] predefinedNames = {
            "Rahul Patil", "Priya Sharma", "Amit Kumar", "Neha Singh", "Rohan Mehta",
            "Sneha Nair", "Vikram Rathore", "Ananya Iyer", "Karan Johar", "Aditi Gupta",
            "Siddharth Roy", "Tanvi Joshi", "Manish Pandey", "Pooja Hegde", "Sanjay Dutt",
            "Divya Bharti", "Rajesh Khanna", "Shalini Sen", "Arjun Kapoor", "Kriti Sanon",
            "Varun Dhawan", "Alia Bhatt", "Ranbir Kapoor", "Deepika Padukone", "Ranveer Singh"
        };

        for (int i = 0; i < predefinedNames.length; i++) {
            String name = predefinedNames[i];
            String email = name.toLowerCase().replace(" ", "") + "@gmail.com";
            
            // Random preferences
            LearningGoal learningGoal = LearningGoal.values()[random.nextInt(LearningGoal.values().length)];
            GoalTimeline goalTimeline = GoalTimeline.values()[random.nextInt(GoalTimeline.values().length)];
            TeachingMotivation teachingMotivation = TeachingMotivation.values()[random.nextInt(TeachingMotivation.values().length)];
            LearningMethod learningMethod = LearningMethod.values()[random.nextInt(LearningMethod.values().length)];
            CommunicationPace communicationPace = CommunicationPace.values()[random.nextInt(CommunicationPace.values().length)];
            DomainFocus domainFocus = DomainFocus.values()[random.nextInt(DomainFocus.values().length)];

            List<TeachingApproach> approaches = List.of(
                TeachingApproach.values()[random.nextInt(TeachingApproach.values().length)],
                TeachingApproach.values()[random.nextInt(TeachingApproach.values().length)]
            );

            String city = faker.address().city();
            String bio = "Software Developer and Engineer passionate about building projects in " + city + ". " + faker.lorem().sentence();

            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(encodedPassword)
                    .bio(bio)
                    .isActive(true)
                    .isVerified(true)
                    .isProfileComplete(true)
                    .role(Role.USER)
                    .provider(AuthProvider.LOCAL)
                    .profilePicUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=" + name.replace(" ", ""))
                    .location(city)
                    .timezone("Asia/Kolkata")
                    .learningGoal(learningGoal)
                    .goalTimeline(goalTimeline)
                    .teachingMotivation(teachingMotivation)
                    .teachingApproaches(approaches)
                    .preferredLearningMethod(learningMethod)
                    .communicationPace(communicationPace)
                    .preferredLanguage("English")
                    .domainFocus(domainFocus)
                    .hoursPerWeek(faker.number().numberBetween(2, 10))
                    .rating(0.0)
                    .completedSessions(0)
                    .points(100)
                    .level(1)
                    .tokenVersion(0)
                    .build();

            users.add(user);
        }

        List<User> savedUsers = userRepository.saveAll(users);
        log.info("Successfully seeded {} users.", savedUsers.size());
        return savedUsers;
    }
}
