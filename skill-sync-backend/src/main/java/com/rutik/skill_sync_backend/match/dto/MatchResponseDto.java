package com.rutik.skill_sync_backend.match.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDto {

    private Long userId;
    private String name;
    private Double score;
}