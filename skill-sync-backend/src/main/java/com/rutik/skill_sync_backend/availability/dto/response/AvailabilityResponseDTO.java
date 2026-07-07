package com.rutik.skill_sync_backend.availability.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponseDTO {

    private Long id;

    private DayOfWeek day;

    private LocalTime startTime;

    private LocalTime endTime;
}