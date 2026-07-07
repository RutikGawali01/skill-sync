package com.rutik.skill_sync_backend.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {

    private Long id;

    private Long sessionId;

    private Long reviewerId;
    private String reviewerName;

    private Long revieweeId;
    private String revieweeName;

    private Integer overallRating;
    private Integer teachingRating;
    private Integer communicationRating;
    private Integer punctualityRating;
    private Integer knowledgeRating;

    private String feedback;

    private LocalDateTime createdAt;
}