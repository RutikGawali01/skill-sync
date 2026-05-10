package com.rutik.skill_sync_backend.availability.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;

import java.time.LocalTime;

public class AvailabilityValidator {

    private AvailabilityValidator() {
    }

    public static void validateTimeRange(
            LocalTime startTime,
            LocalTime endTime
    ) {

        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException(
                    "Start time must be before end time"
            );
        }
    }
}
