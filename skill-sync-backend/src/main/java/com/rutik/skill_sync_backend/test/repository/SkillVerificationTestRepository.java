package com.rutik.skill_sync_backend.test.repository;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.test.enums.TestStatus;
import com.rutik.skill_sync_backend.test.entity.SkillVerificationTest;


import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SkillVerificationTestRepository extends JpaRepository<SkillVerificationTest, Long> {

    Optional<SkillVerificationTest> findTopByUserSkillOrderByStartedAtDesc(UserSkill userSkill);

    List<SkillVerificationTest> findByStatusAndExpiresAtBefore(
            TestStatus status,
            LocalDateTime time
    );
}
