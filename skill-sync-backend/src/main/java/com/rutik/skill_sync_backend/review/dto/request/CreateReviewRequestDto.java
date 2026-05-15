package com.rutik.skill_sync_backend.review.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateReviewRequestDto {

    @NotNull
    private Long sessionId;

    @NotNull
    private Long revieweeId;

    @Min(1)
    @Max(5)
    private Integer overallRating;

    @Min(1)
    @Max(5)
    private Integer teachingRating;

    @Min(1)
    @Max(5)
    private Integer communicationRating;

    @Min(1)
    @Max(5)
    private Integer punctualityRating;

    @Min(1)
    @Max(5)
    private Integer knowledgeRating;

    @NotBlank
    private String feedback;
}
