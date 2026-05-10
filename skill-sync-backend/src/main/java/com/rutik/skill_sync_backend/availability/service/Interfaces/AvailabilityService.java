package com.rutik.skill_sync_backend.availability.service.Interfaces;

import com.rutik.skill_sync_backend.availability.dto.request.AvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.request.UpdateAvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.CommonAvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.SessionSuggestionResponseDTO;

import java.util.List;

public interface AvailabilityService {

    AvailabilityResponseDTO addAvailability(
            Long userId,
            AvailabilityRequestDTO requestDTO
    );

    AvailabilityResponseDTO updateAvailability(
            Long userId,
            Long availabilityId,
            UpdateAvailabilityRequestDTO requestDTO
    );

    List<AvailabilityResponseDTO> getUserAvailability(
            Long userId
    );

    List<CommonAvailabilityResponseDTO> getCommonAvailability(
            Long firstUserId,
            Long secondUserId
    );

    void deleteAvailability(
            Long userId,
            Long availabilityId
    );
    List<SessionSuggestionResponseDTO> getSessionSuggestions(
            Long firstUserId,
            Long secondUserId,
            Integer minimumDurationMinutes
    );
}