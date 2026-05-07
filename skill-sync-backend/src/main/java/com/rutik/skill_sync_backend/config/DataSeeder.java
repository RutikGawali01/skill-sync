package com.rutik.skill_sync_backend.config;

import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.enums.SkillCategory;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;

    @Override
    public void run(String... args) {

        if (skillRepository.count() > 0) {
            return;
        }

        List<Skill> skills = List.of(

                // FRONTEND
                Skill.builder()
                        .name("JavaScript")
                        .category(SkillCategory.FRONTEND)
                        .build(),

                Skill.builder()
                        .name("TypeScript")
                        .category(SkillCategory.FRONTEND)
                        .build(),

                Skill.builder()
                        .name("React")
                        .category(SkillCategory.FRONTEND)
                        .build(),

                Skill.builder()
                        .name("Figma / UI Design")
                        .category(SkillCategory.DESIGN)
                        .build(),

                // BACKEND
                Skill.builder()
                        .name("Node.js")
                        .category(SkillCategory.BACKEND)
                        .build(),

                Skill.builder()
                        .name("Python")
                        .category(SkillCategory.BACKEND)
                        .build(),

                Skill.builder()
                        .name("Java")
                        .category(SkillCategory.BACKEND)
                        .build(),

                Skill.builder()
                        .name("Spring Boot")
                        .category(SkillCategory.BACKEND)
                        .build(),

                Skill.builder()
                        .name("GraphQL")
                        .category(SkillCategory.BACKEND)
                        .build(),

                // DATABASE
                Skill.builder()
                        .name("SQL / PostgreSQL")
                        .category(SkillCategory.DATABASE)
                        .build(),

                // DEVOPS
                Skill.builder()
                        .name("Docker")
                        .category(SkillCategory.DEVOPS)
                        .build(),

                Skill.builder()
                        .name("Kubernetes")
                        .category(SkillCategory.DEVOPS)
                        .build(),

                Skill.builder()
                        .name("Git")
                        .category(SkillCategory.DEVOPS)
                        .build(),

                // CLOUD
                Skill.builder()
                        .name("AWS")
                        .category(SkillCategory.CLOUD)
                        .build(),

                // AI / ML
                Skill.builder()
                        .name("Machine Learning")
                        .category(SkillCategory.AI_ML)
                        .build(),

                // PROGRAMMING
                Skill.builder()
                        .name("Data Structures & Algorithms")
                        .category(SkillCategory.PROGRAMMING)
                        .build(),

                Skill.builder()
                        .name("System Design")
                        .category(SkillCategory.PROGRAMMING)
                        .build(),

                // OTHER LANGUAGES
                Skill.builder()
                        .name("Rust")
                        .category(SkillCategory.PROGRAMMING)
                        .build(),

                Skill.builder()
                        .name("Go")
                        .category(SkillCategory.PROGRAMMING)
                        .build(),

                Skill.builder()
                        .name("Kotlin")
                        .category(SkillCategory.MOBILE)
                        .build()
        );

        skillRepository.saveAll(skills);

        System.out.println("✅ Skills seeded successfully");
    }
}
