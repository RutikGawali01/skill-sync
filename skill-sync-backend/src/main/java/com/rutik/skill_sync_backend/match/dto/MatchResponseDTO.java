package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDTO {
    private MatchCandidateDTO candidate;
    private String matchType; // "BASIC" or "MUTUAL"
    private BasicMatchDTO basicMatch;
    private MutualMatchDTO mutualMatch;
    private Double score;
}