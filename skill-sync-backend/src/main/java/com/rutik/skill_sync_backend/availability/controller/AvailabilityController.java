package com.rutik.skill_sync_backend.availability.controller;

import com.rutik.skill_sync_backend.availability.dto.request.AvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.request.UpdateAvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.CommonAvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.SessionSuggestionResponseDTO;
import com.rutik.skill_sync_backend.availability.service.Interfaces.AvailabilityService;
import com.rutik.skill_sync_backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // 🔥 ADD SLOT
    @PostMapping("/user/{userId}")
    public ApiResponse<AvailabilityResponseDTO> addAvailability(

            @PathVariable Long userId,

            @Valid
            @RequestBody
            AvailabilityRequestDTO requestDTO
    ) {

        return ApiResponse.success(
                "Availability slot added successfully",
                availabilityService.addAvailability(userId, requestDTO)
        );
    }

    // 🔥 UPDATE SLOT
    @PutMapping("/user/{userId}/{availabilityId}")
    public ApiResponse<AvailabilityResponseDTO> updateAvailability(

            @PathVariable Long userId,

            @PathVariable Long availabilityId,

            @Valid
            @RequestBody
            UpdateAvailabilityRequestDTO requestDTO
    ) {

        return ApiResponse.success(
                "Availability updated successfully",
                availabilityService.updateAvailability(
                        userId,
                        availabilityId,
                        requestDTO
                )
        );
    }

    // 🔥 GET USER AVAILABILITY
    @GetMapping("/user/{userId}")
    public ApiResponse<List<AvailabilityResponseDTO>>
    getUserAvailability(
            @PathVariable Long userId
    ) {

        return ApiResponse.success(
                "Availability fetched successfully",
                availabilityService.getUserAvailability(userId)
        );
    }

    // 🔥 GET COMMON SLOTS
    @GetMapping("/common")
    public ApiResponse<List<CommonAvailabilityResponseDTO>>
    getCommonAvailability(

            @RequestParam Long firstUserId,

            @RequestParam Long secondUserId
    ) {

        return ApiResponse.success(
                "Common availability fetched successfully",
                availabilityService.getCommonAvailability(
                        firstUserId,
                        secondUserId
                )
        );
    }

    // 🔥 DELETE SLOT
    @DeleteMapping("/user/{userId}/{availabilityId}")
    public ApiResponse<Void> deleteAvailability(

            @PathVariable Long userId,

            @PathVariable Long availabilityId
    ) {

        availabilityService.deleteAvailability(
                userId,
                availabilityId
        );

        return ApiResponse.success(
                "Availability deleted successfully"
        );
    }

    // 🔥 AUTO SESSION SUGGESTIONS
    @GetMapping("/session-suggestions")
    public ApiResponse<List<SessionSuggestionResponseDTO>>
    getSessionSuggestions(

            @RequestParam Long firstUserId,

            @RequestParam Long secondUserId,

            @RequestParam(defaultValue = "60")
            Integer minimumDurationMinutes
    ) {

        return ApiResponse.success(
                "Session suggestions fetched successfully",
                availabilityService.getSessionSuggestions(
                        firstUserId,
                        secondUserId,
                        minimumDurationMinutes
                )
        );
    }
}
