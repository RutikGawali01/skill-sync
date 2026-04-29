package com.rutik.skill_sync_backend.user.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.common.response.PagedResponse;
import com.rutik.skill_sync_backend.user.dto.UpdateProfileRequestDTO;
import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    // 🔥 Update Profile
    // ✅ GET PROFILE (CURRENT USER)
    @GetMapping
    public ApiResponse<UserProfileResponseDTO> getMyProfile(Authentication auth) {

        User user = (User) auth.getPrincipal(); // ✅ FIX

        return ApiResponse.success(
                "Profile fetched successfully",
                userService.getProfileById(user.getId())
        );
    }

    @PutMapping
    public ApiResponse<UserProfileResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO request,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();  // ✅ FIX

        return ApiResponse.success(
                "Profile updated successfully",
                userService.updateProfileById(user.getId(), request)
        );
    }

    // ✅ PUBLIC PROFILE (FOR MATCHING / VIEW)
    @GetMapping("/{userId}")
    public ApiResponse<UserProfileResponseDTO> getUserProfile(@PathVariable Long userId) {

        return ApiResponse.success(
                "User profile fetched",
                userService.getProfileById(userId)
        );
    }

    @GetMapping("/search")
    public ApiResponse<PagedResponse<UserProfileResponseDTO>> searchProfiles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sortBy
    ) {

        return ApiResponse.success(
                "Profiles fetched successfully",
                userService.searchProfiles(keyword, page, size, sortBy)
        );
    }
}