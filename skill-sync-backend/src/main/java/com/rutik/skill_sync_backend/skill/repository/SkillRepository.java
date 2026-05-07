package com.rutik.skill_sync_backend.skill.repository;

import com.rutik.skill_sync_backend.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByName(String name);

    List<Skill> findByNameContainingIgnoreCase(String keyword);
}
