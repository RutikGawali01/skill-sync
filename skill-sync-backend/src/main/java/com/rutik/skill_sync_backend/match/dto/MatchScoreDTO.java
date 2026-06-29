package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchScoreDTO {
    private Double overallScore;
    private Double percentage;
    private Double confidence;
    private ScoreBreakdownDTO breakdown;
}
