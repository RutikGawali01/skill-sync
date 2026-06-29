package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class UserSkillSeeder {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final Random random = new Random();

    public void seed(List<User> users) {
//        if (userSkillRepository.count() > 0) {
//            log.info("User skills already exist. Skipping user skill seeding.");
//            return;
//        }

        log.info("Assigning Skills...");
        List<Skill> allSkills = skillRepository.findAll();
        if (allSkills.isEmpty()) {
            log.warn("No skills available to assign to users.");
            return;
        }

        // Locate key skills for intentional matching
        Skill java = findSkill(allSkills, "Java");
        Skill springBoot = findSkill(allSkills, "Spring Boot");
        Skill react = findSkill(allSkills, "React");
        Skill docker = findSkill(allSkills, "Docker");
        Skill aws = findSkill(allSkills, "AWS");

        List<UserSkill> toSave = new ArrayList<>();

        for (User user : users) {
            String name = user.getName();
            
            if ("Rahul Patil".equalsIgnoreCase(name)) {
                // Rahul: Offers Java, Spring Boot | Wants React
                toSave.add(createUserSkill(user, java, SkillType.OFFER, SkillLevel.ADVANCED));
                toSave.add(createUserSkill(user, springBoot, SkillType.OFFER, SkillLevel.INTERMEDIATE));
                toSave.add(createUserSkill(user, react, SkillType.WANT, SkillLevel.BEGINNER));
            } else if ("Priya Sharma".equalsIgnoreCase(name)) {
                // Priya: Offers React | Wants Java, AWS
                toSave.add(createUserSkill(user, react, SkillType.OFFER, SkillLevel.ADVANCED));
                toSave.add(createUserSkill(user, java, SkillType.WANT, SkillLevel.INTERMEDIATE));
                toSave.add(createUserSkill(user, aws, SkillType.WANT, SkillLevel.BEGINNER));
            } else if ("Amit Kumar".equalsIgnoreCase(name)) {
                // Amit: Offers Docker | Wants AWS
                toSave.add(createUserSkill(user, docker, SkillType.OFFER, SkillLevel.ADVANCED));
                toSave.add(createUserSkill(user, aws, SkillType.WANT, SkillLevel.BEGINNER));
            } else if ("Neha Singh".equalsIgnoreCase(name)) {
                // Neha: Offers AWS | Wants Docker
                toSave.add(createUserSkill(user, aws, SkillType.OFFER, SkillLevel.ADVANCED));
                toSave.add(createUserSkill(user, docker, SkillType.WANT, SkillLevel.BEGINNER));
            } else {
                // Random assignments for other users
                List<Skill> shuffled = new ArrayList<>(allSkills);
                Collections.shuffle(shuffled);

                int numOffers = random.nextInt(3) + 2; // 2 to 4
                int numWants = random.nextInt(3) + 2;  // 2 to 4

                for (int i = 0; i < numOffers && i < shuffled.size(); i++) {
                    toSave.add(createUserSkill(user, shuffled.get(i), SkillType.OFFER, randomLevel()));
                }

                for (int i = numOffers; i < (numOffers + numWants) && i < shuffled.size(); i++) {
                    toSave.add(createUserSkill(user, shuffled.get(i), SkillType.WANT, randomLevel()));
                }
            }
        }

        userSkillRepository.saveAll(toSave);
        log.info("Successfully assigned {} user skills.", toSave.size());
    }

    private Skill findSkill(List<Skill> skills, String name) {
        return skills.stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(skills.get(0)); // fallback
    }

    private UserSkill createUserSkill(User user, Skill skill, SkillType type, SkillLevel level) {
        return UserSkill.builder()
                .user(user)
                .skill(skill)
                .type(type)
                .level(level)
                .isVisible(true)
                .isVerified(true)
                .build();
    }

    private SkillLevel randomLevel() {
        return SkillLevel.values()[random.nextInt(SkillLevel.values().length)];
    }
}
