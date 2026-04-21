package com.rutik.skill_sync_backend.user.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.user.dto.UpdateProfileRequestDTO;
import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;
import com.rutik.skill_sync_backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    // 🔥 Update Profile
    @PutMapping("/{userId}/profile")
    public ApiResponse<UserProfileResponseDTO> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequestDTO request
    ) {
//        System.out.println(1);
//        log.info("1");
        return ApiResponse.success(
                "Profile updated successfully",
                userService.updateProfile(userId, request)
        );
    }

    // 🔥 Get Profile
    @GetMapping("/{userId}/profile")
    public ApiResponse<UserProfileResponseDTO> getProfile(@PathVariable Long userId) {
        return ApiResponse.success(
                "Profile fetched successfully",
                userService.getProfile(userId)
        );
    }
}