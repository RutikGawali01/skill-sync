package com.rutik.skill_sync_backend.availability.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
public class CommonAvailabilityResponseDTO {

    private DayOfWeek day;

    private LocalTime commonStartTime;

    private LocalTime commonEndTime;
}
