package com.rutik.skill_sync_backend.test.mapper;

import com.rutik.skill_sync_backend.test.dto.response.GeneratedTestResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestQuestionResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestResultResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestSubmissionResultDto;
import com.rutik.skill_sync_backend.test.entity.SkillVerificationTest;
import com.rutik.skill_sync_backend.test.entity.TestQuestion;
import com.rutik.skill_sync_backend.test.enums.TestStatus;

import java.util.List;

public class TestMapper {

    private TestMapper() {
    }

    /**
     * Maps TestQuestion entity to response DTO
     * IMPORTANT:
     * Never expose correctAnswer to frontend
     */
    public static TestQuestionResponseDto mapToQuestionResponse(
            TestQuestion question
    ) {

        return TestQuestionResponseDto.builder()
                .questionId(question.getId())
                .question(question.getQuestion())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .build();
    }

    /**
     * Maps list of questions
     */
    public static List<TestQuestionResponseDto> mapToQuestionResponseList(
            List<TestQuestion> questions
    ) {

        return questions.stream()
                .map(TestMapper::mapToQuestionResponse)
                .toList();
    }

    /**
     * Maps generated test response
     */
    public static GeneratedTestResponseDto mapToGeneratedTestResponse(
            SkillVerificationTest test
    ) {

        return GeneratedTestResponseDto.builder()
                .testId(test.getId())
                .totalQuestions(test.getTotalQuestions())
                .durationInMinutes(test.getDurationInMinutes())
                .expiresAt(test.getExpiresAt())
                .questions(
                        mapToQuestionResponseList(test.getQuestions())
                )
                .build();
    }

    /**
     * Maps test submission result response
     */
    public static TestSubmissionResultDto mapToSubmissionResultResponse(
            SkillVerificationTest test,
            boolean isVerified
    ) {

        return TestSubmissionResultDto.builder()
                .testId(test.getId())
                .scorePercentage(test.getScorePercentage())
                .requiredPercentage(test.getPassingPercentage())
                .isVerified(isVerified)
                .result(
                        isVerified
                                ? TestStatus.PASSED.name()
                                : TestStatus.FAILED.name()
                )
                .build();
    }

    /**
     * Maps test result response
     */
    public static TestResultResponseDto mapToTestResultResponse(
            SkillVerificationTest test
    ) {

        return TestResultResponseDto.builder()
                .testId(test.getId())
                .scorePercentage(test.getScorePercentage())
                .submittedAt(test.getSubmittedAt())
                .isVerified(
                        test.getStatus() == TestStatus.PASSED
                )
                .result(test.getStatus().name())
                .build();
    }
}
