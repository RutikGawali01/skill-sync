package com.rutik.skill_sync_backend.user.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.user.dto.AvailabilityDTO;
import com.rutik.skill_sync_backend.user.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // 🔥 SAVE / UPDATE AVAILABILITY
    @PostMapping
    public ApiResponse<Void> saveAvailability(
            @PathVariable Long userId,
            @Valid @RequestBody List<AvailabilityDTO> availabilityList
    ) {
        availabilityService.saveAvailability(userId, availabilityList);

        return ApiResponse.success("Availability saved successfully");
    }

    // 🔥 GET AVAILABILITY
    @GetMapping
    public ApiResponse<List<AvailabilityDTO>> getAvailability(
            @PathVariable Long userId
    ) {
        return ApiResponse.success(
                "Availability fetched successfully",
                availabilityService.getAvailability(userId)
        );
    }
}