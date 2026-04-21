package com.rutik.skill_sync_backend.user.service;

import com.rutik.skill_sync_backend.user.dto.UpdateProfileRequestDTO;
import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;

public interface UserService {

    UserProfileResponseDTO getProfile(Long userId);

    UserProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO request);
}
