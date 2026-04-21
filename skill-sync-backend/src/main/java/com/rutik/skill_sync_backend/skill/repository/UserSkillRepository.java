package com.rutik.skill_sync_backend.skill.repository;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserId(Long userId);

    boolean existsByUserIdAndSkillIdAndType(Long userId, Long skillId, Enum type);
}
