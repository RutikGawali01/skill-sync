package com.rutik.skill_sync_backend.test.service.impl;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.test.dto.request.GenerateTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.request.SubmitTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.request.SubmittedAnswerDto;
import com.rutik.skill_sync_backend.test.dto.response.GeneratedTestResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestQuestionResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestResultResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestSubmissionResultDto;
import com.rutik.skill_sync_backend.test.entity.SkillVerificationTest;
import com.rutik.skill_sync_backend.test.entity.TestQuestion;
import com.rutik.skill_sync_backend.test.entity.TestSubmission;
import com.rutik.skill_sync_backend.test.enums.TestStatus;
import com.rutik.skill_sync_backend.test.mapper.TestMapper;
import com.rutik.skill_sync_backend.test.repository.SkillVerificationTestRepository;
import com.rutik.skill_sync_backend.test.repository.TestQuestionRepository;
import com.rutik.skill_sync_backend.test.repository.TestSubmissionRepository;
import com.rutik.skill_sync_backend.test.service.Interface.AiQuestionGenerationService;
import com.rutik.skill_sync_backend.test.service.Interface.SkillVerificationTestService;
import com.rutik.skill_sync_backend.test.util.TestEvaluationUtil;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SkillVerificationTestServiceImpl implements SkillVerificationTestService {

    @Value("${test.total-questions}")
    private Integer totalQuestions;

    @Value("${test.duration-minutes}")
    private Integer durationInMinutes;

    @Value("${test.pass-percentage}")
    private Double passPercentage;

    @Value("${test.retry-hours}")
    private Integer retryHours;


    private final TestQuestionRepository questionRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillVerificationTestRepository testRepository;
    private final TestSubmissionRepository submissionRepository;
    private final AiQuestionGenerationService aiQuestionGenerationService;

    @Override
    public GeneratedTestResponseDto generateTest(
            GenerateTestRequestDto requestDto
    ) {

        log.info(
                "Generating verification test for user skill id: {}",
                requestDto.getUserSkillId()
        );

        UserSkill userSkill =
                userSkillRepository.findById(
                                requestDto.getUserSkillId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User skill not found"
                                )
                        );

        validateSkillForVerification(userSkill);

        List<TestQuestion> questions =
                aiQuestionGenerationService.generateQuestions(userSkill);

        if (questions.isEmpty()) {

            throw new BadRequestException(
                    "Failed to generate test questions"
            );
        }

        SkillVerificationTest test =
                SkillVerificationTest.builder()
                        .userSkill(userSkill)
                        .totalQuestions(totalQuestions)
                        .durationInMinutes(durationInMinutes)
                        .passingPercentage(passPercentage)
                        .status(TestStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(durationInMinutes)
                        )
                        .build();

        SkillVerificationTest savedTest =
                testRepository.save(test);

        log.info(
                "Verification test created successfully. Test id: {}",
                savedTest.getId()
        );

        // ==========================================
        // LINK QUESTIONS WITH TEST
        // ==========================================

        questions.forEach(question ->
                question.setTest(savedTest)
        );

        // ==========================================
        // SAVE QUESTIONS
        // IMPORTANT:
        // IDs will be generated here
        // ==========================================

        List<TestQuestion> savedQuestions =
                questionRepository.saveAll(questions);

        savedTest.setQuestions(savedQuestions);

        log.info(
                "Saved {} questions for test id: {}",
                savedQuestions.size(),
                savedTest.getId()
        );

        // ==========================================
        // MAP QUESTIONS TO RESPONSE DTO
        // ==========================================

        List<TestQuestionResponseDto> questionResponses =
                savedQuestions.stream()
                        .map(TestMapper::mapToQuestionResponse)
                        .toList();

        return GeneratedTestResponseDto.builder()
                .testId(savedTest.getId())
                .durationInMinutes(
                        savedTest.getDurationInMinutes()
                )
                .totalQuestions(
                        savedTest.getTotalQuestions()
                )
                .expiresAt(savedTest.getExpiresAt())
                .questions(questionResponses)
                .build();
    }

    @Override
    public TestSubmissionResultDto submitTest(
            SubmitTestRequestDto requestDto
    ) {

        SkillVerificationTest test =
                testRepository.findById(requestDto.getTestId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Test not found"
                                )
                        );

        validateTestSubmission(test);

        int correctAnswers = 0;

        for (SubmittedAnswerDto answerDto : requestDto.getAnswers()) {

            TestQuestion question =
                    test.getQuestions()
                            .stream()
                            .filter(q ->
                                    q.getId()
                                            .equals(answerDto.getQuestionId())
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Question not found"
                                    )
                            );

            boolean isCorrect =
                    question.getCorrectAnswer()
                            .equalsIgnoreCase(
                                    answerDto.getSelectedAnswer()
                            );

            if (isCorrect) {
                correctAnswers++;
            }

            TestSubmission submission =
                    TestSubmission.builder()
                            .test(test)
                            .question(question)
                            .selectedAnswer(
                                    answerDto.getSelectedAnswer()
                            )
                            .isCorrect(isCorrect)
                            .build();

            submissionRepository.save(submission);
        }

        double percentage =
                TestEvaluationUtil.calculatePercentage(
                        correctAnswers,
                        test.getTotalQuestions()
                );

        boolean passed =
                TestEvaluationUtil.isPassed(
                        percentage,
                        passPercentage
                );

        test.setScorePercentage(percentage);
        test.setSubmittedAt(LocalDateTime.now());
        test.setStatus(
                passed
                        ? TestStatus.PASSED
                        : TestStatus.FAILED
        );

        UserSkill userSkill = test.getUserSkill();

        userSkill.setLastTestAttemptAt(LocalDateTime.now());

        Integer currentAttempts =
                userSkill.getVerificationAttempts() == null
                        ? 0
                        : userSkill.getVerificationAttempts();

        userSkill.setVerificationAttempts(
                currentAttempts + 1
        );

        if (passed) {

            userSkill.setIsVerified(true);

            userSkill.setVerificationScore(percentage);

            userSkill.setVerifiedAt(LocalDateTime.now());

            // remove cooldown after successful verification
            userSkill.setRetryAvailableAt(null);

        } else {

            // cooldown after failed verification
            userSkill.setLastVerificationFailedAt(
                    LocalDateTime.now()
            );

            userSkill.setRetryAvailableAt(
                    LocalDateTime.now()
                            .plusHours(retryHours)
            );
        }

        log.info(
                "Verification test submitted successfully. TestId: {}, Score: {}, Passed: {}",
                test.getId(),
                percentage,
                passed
        );

        return TestMapper.mapToSubmissionResultResponse(
                test,
                passed
        );
    }


    @Override
    @Transactional(readOnly = true)
    public TestResultResponseDto getTestResult(Long testId) {

        SkillVerificationTest test =
                testRepository.findById(testId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Test not found"
                                )
                        );

        log.info(
                "Fetching test result for test id: {}",
                testId
        );

        return TestMapper.mapToTestResultResponse(test);
    }


    @Override
    @Scheduled(fixedRate = 60000)
    public void expireTests() {

        List<SkillVerificationTest> expiredTests =
                testRepository.findByStatusAndExpiresAtBefore(
                        TestStatus.IN_PROGRESS,
                        LocalDateTime.now()
                );

        if (expiredTests.isEmpty()) {

            log.info("No expired tests found");

            return;
        }

        expiredTests.forEach(test -> {

            test.setStatus(TestStatus.EXPIRED);

            log.info(
                    "Marked test as expired. TestId: {}",
                    test.getId()
            );
        });

        log.info(
                "Expired {} verification tests",
                expiredTests.size()
        );
    }


    private void validateSkillForVerification(
            UserSkill userSkill
    ) {

        if (userSkill.getType() != SkillType.OFFER) {

            throw new BadRequestException(
                    "Only offering skills can be verified"
            );
        }

        if (Boolean.TRUE.equals(userSkill.getIsVerified())) {

            throw new BadRequestException(
                    "Skill already verified"
            );
        }

        if (userSkill.getRetryAvailableAt() != null
                && userSkill.getRetryAvailableAt()
                .isAfter(LocalDateTime.now())) {

            throw new BadRequestException(
                    "Retry available after 24 hours"
            );
        }
    }

    private void validateTestSubmission(
            SkillVerificationTest test
    ) {

        if (test.getStatus() != TestStatus.IN_PROGRESS) {

            throw new BadRequestException(
                    "Test already submitted or expired"
            );
        }

        if (LocalDateTime.now().isAfter(test.getExpiresAt())) {

            test.setStatus(TestStatus.EXPIRED);

            throw new BadRequestException(
                    "Test has expired"
            );
        }
    }

}
