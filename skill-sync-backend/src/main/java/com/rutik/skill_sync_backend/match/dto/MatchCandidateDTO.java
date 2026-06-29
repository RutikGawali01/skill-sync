package com.rutik.skill_sync_backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchCandidateDTO {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String profilePicUrl;
    private String location;
    private Double rating;
    private Integer completedSessions;
}
