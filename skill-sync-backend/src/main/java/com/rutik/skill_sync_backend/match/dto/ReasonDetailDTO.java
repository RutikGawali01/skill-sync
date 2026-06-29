package com.rutik.skill_sync_backend.match.dto;

import com.rutik.skill_sync_backend.match.enums.ReasonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReasonDetailDTO {
    private ReasonType reasonType;
    private String message;
    private Double weightContribution;
}
