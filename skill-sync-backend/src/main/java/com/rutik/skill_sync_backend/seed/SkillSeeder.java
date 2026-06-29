package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.enums.SkillCategory;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class SkillSeeder {

    private final SkillRepository skillRepository;

    public void seed() {
//        if (skillRepository.count() > 0) {
//            log.info("Skills already seeded. Skipping.");
//            return;
//        }

        log.info("Creating Skills...");

        Map<SkillCategory, List<String>> predefinedSkills = Map.of(
            SkillCategory.BACKEND, List.of("Java", "Spring Boot", "Hibernate", "Node.js", "Express.js"),
            SkillCategory.FRONTEND, List.of("React", "Angular", "Vue", "HTML", "CSS"),
            SkillCategory.DEVOPS, List.of("Docker", "Kubernetes", "AWS", "Azure", "Jenkins"),
            SkillCategory.PROGRAMMING, List.of("C++", "Python", "Go", "Rust"),
            SkillCategory.AI_ML, List.of("Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"),
            SkillCategory.DATABASE, List.of("PostgreSQL", "MongoDB", "MySQL", "Redis"),
            SkillCategory.OTHER, List.of("Algorithms", "Competitive Programming")
        );

        List<Skill> toSave = new ArrayList<>();
        predefinedSkills.forEach((category, skillNames) -> {
            for (String name : skillNames) {
                toSave.add(Skill.builder()
                        .name(name)
                        .category(category)
                        .build());
            }
        });

        skillRepository.saveAll(toSave);
        log.info("Successfully seeded {} skills.", toSave.size());
    }
}
