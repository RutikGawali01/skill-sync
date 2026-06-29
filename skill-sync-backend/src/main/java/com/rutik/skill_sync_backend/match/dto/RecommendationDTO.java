package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private MatchCandidateDTO candidate;
    private MatchScoreDTO matchScore;
    private RecommendationReasonDTO recommendationReason;
}
