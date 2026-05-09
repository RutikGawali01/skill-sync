package com.rutik.skill_sync_backend.test.service.Interface;

import com.rutik.skill_sync_backend.test.dto.request.GenerateTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.request.SubmitTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.response.GeneratedTestResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestResultResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestSubmissionResultDto;

public interface SkillVerificationTestService {

    GeneratedTestResponseDto generateTest(GenerateTestRequestDto requestDto);

    TestSubmissionResultDto submitTest(SubmitTestRequestDto requestDto);

    TestResultResponseDto getTestResult(Long testId);

    void expireTests();
}
