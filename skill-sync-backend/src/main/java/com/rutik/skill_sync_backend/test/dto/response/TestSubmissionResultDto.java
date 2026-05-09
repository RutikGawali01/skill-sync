package com.rutik.skill_sync_backend.test.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestSubmissionResultDto {

    private Long testId;

    private Double scorePercentage;

    private Boolean isVerified;

    private String result;

    private Double requiredPercentage;
}
