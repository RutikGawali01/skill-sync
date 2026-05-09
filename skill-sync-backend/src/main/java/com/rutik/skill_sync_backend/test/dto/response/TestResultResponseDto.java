package com.rutik.skill_sync_backend.test.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TestResultResponseDto {

    private Long testId;

    private Double scorePercentage;

    private Boolean isVerified;

    private String result;

    private LocalDateTime submittedAt;
}
