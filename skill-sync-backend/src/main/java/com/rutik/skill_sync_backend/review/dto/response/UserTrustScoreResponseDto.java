package com.rutik.skill_sync_backend.review.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserTrustScoreResponseDto {

    private Long userId;

    private Double averageRating;

    private Integer totalReviews;

    private Integer completedSessions;

    private Integer cancelledSessions;

    private Double completionRate;

    private Double trustScore;
}