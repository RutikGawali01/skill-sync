package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreBreakdownDTO {
    private Double skillScore;
    private Double trustScore;
    private Double ratingScore;
    private Double availabilityScore;
    private Double experienceScore;
    private Double activityScore;
}
