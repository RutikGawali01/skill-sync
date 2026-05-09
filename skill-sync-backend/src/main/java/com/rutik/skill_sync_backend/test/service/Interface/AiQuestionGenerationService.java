package com.rutik.skill_sync_backend.test.service.Interface;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.test.entity.TestQuestion;

import java.util.List;

public interface AiQuestionGenerationService {

    List<TestQuestion> generateQuestions(UserSkill userSkill);
}
