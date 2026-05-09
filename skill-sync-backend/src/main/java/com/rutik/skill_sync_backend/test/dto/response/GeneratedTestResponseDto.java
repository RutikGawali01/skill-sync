package com.rutik.skill_sync_backend.test.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class GeneratedTestResponseDto {

    private Long testId;

    private Integer totalQuestions;

    private Integer durationInMinutes;

    private LocalDateTime expiresAt;

    private List<TestQuestionResponseDto> questions;
}