package com.rutik.skill_sync_backend.availability.mapper;

import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.entity.Availability;

public class AvailabilityMapper {

    private AvailabilityMapper() {
    }

    public static AvailabilityResponseDTO toDTO(Availability availability) {

        return AvailabilityResponseDTO.builder()
                .id(availability.getId())
                .day(availability.getDay())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .build();
    }
}
