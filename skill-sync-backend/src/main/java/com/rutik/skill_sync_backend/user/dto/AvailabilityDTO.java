package com.rutik.skill_sync_backend.user.dto;

import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class AvailabilityDTO {

    private DayOfWeek day;
    private LocalTime startTime;
    private LocalTime endTime;
}