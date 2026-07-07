package com.rutik.skill_sync_backend.review.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTrustScoreResponseDto {

    private Long userId;

    private Double averageRating;

    private Integer totalReviews;

    private Integer completedSessions;

    private Integer cancelledSessions;

    private Double completionRate;

    private Double trustScore;
}