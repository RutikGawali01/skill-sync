package com.rutik.skill_sync_backend.config;

import com.rutik.skill_sync_backend.skill.entity.Skill;
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

        if (skillRepository.count() == 0) {

            List<Skill> skills = List.of(
                    Skill.builder().name("Java").category("Backend").build(),
                    Skill.builder().name("Spring Boot").category("Backend").build(),
                    Skill.builder().name("React").category("Frontend").build(),
                    Skill.builder().name("DSA").category("Programming").build(),
                    Skill.builder().name("Docker").category("DevOps").build()
            );

            skillRepository.saveAll(skills);
        }
    }
}
