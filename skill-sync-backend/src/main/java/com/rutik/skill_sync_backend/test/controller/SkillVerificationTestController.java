package com.rutik.skill_sync_backend.test.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.test.dto.request.GenerateTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.request.SubmitTestRequestDto;
import com.rutik.skill_sync_backend.test.dto.response.GeneratedTestResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestResultResponseDto;
import com.rutik.skill_sync_backend.test.dto.response.TestSubmissionResultDto;
import com.rutik.skill_sync_backend.test.service.Interface.SkillVerificationTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Slf4j
public class SkillVerificationTestController {

    private final SkillVerificationTestService testService;

        @PostMapping("/generate")
        public ResponseEntity<ApiResponse<GeneratedTestResponseDto>> generateTest(
                @Valid @RequestBody GenerateTestRequestDto requestDto
        ) {
            log.info("Generating verification test for user skill id: {}", requestDto.getUserSkillId());

            GeneratedTestResponseDto response = testService.generateTest(requestDto);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Test generated successfully",
                            response
                    )
            );
        }


    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<TestSubmissionResultDto>> submitTest(
            @Valid @RequestBody SubmitTestRequestDto requestDto
    ) {

        log.info("Submitting verification test id: {}", requestDto.getTestId());

        TestSubmissionResultDto response = testService.submitTest(requestDto);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Test submitted successfully",
                        response
                )
        );
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<ApiResponse<TestResultResponseDto>> getResult(
            @PathVariable Long id
    ) {

        log.info("Fetching verification result for test id: {}", id);

        TestResultResponseDto response = testService.getTestResult(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Test result fetched successfully",
                        response
                )
        );
    }
}
