package com.rutik.skill_sync_backend.availability.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
public class SessionSuggestionResponseDTO {

    private DayOfWeek day;

    private LocalTime suggestedStartTime;

    private LocalTime suggestedEndTime;

    // 🔥 TOTAL MINUTES AVAILABLE
    private Long durationInMinutes;
}
