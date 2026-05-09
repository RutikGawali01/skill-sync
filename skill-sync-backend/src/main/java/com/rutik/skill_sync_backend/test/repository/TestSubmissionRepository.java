package com.rutik.skill_sync_backend.test.repository;

import com.rutik.skill_sync_backend.test.entity.SkillVerificationTest;
import com.rutik.skill_sync_backend.test.entity.TestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSubmissionRepository extends JpaRepository<TestSubmission, Long> {

    List<TestSubmission> findByTest(SkillVerificationTest test);
}