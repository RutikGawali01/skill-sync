package com.rutik.skill_sync_backend.test.repository;

import com.rutik.skill_sync_backend.test.entity.SkillVerificationTest;
import com.rutik.skill_sync_backend.test.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {

    List<TestQuestion> findByTest(SkillVerificationTest test);
}
