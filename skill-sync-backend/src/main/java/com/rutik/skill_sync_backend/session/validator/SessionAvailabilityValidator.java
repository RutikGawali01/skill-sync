package com.rutik.skill_sync_backend.session.validator;


import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Component
public class SessionAvailabilityValidator {

    public void validateProviderAvailability(
            List<Availability> availabilities,
            DayOfWeek requestedDay,
            LocalTime requestedStart,
            LocalTime requestedEnd
    ) {

        boolean available = availabilities.stream().anyMatch(slot ->

                slot.getDay() == requestedDay
                        &&
                        !slot.getStartTime().isAfter(requestedStart)
                        &&
                        !slot.getEndTime().isBefore(requestedEnd)
        );

        if (!available) {

            throw new BadRequestException(
                    "Provider is not available during requested time"
            );
        }
    }
}
