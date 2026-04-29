package com.rutik.skill_sync_backend.user.service;

import com.rutik.skill_sync_backend.common.response.PagedResponse;
import com.rutik.skill_sync_backend.user.dto.UpdateProfileRequestDTO;
import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;

public interface UserService {

//    UserProfileResponseDTO getProfile(Long userId);
//
//    UserProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO request);

    UserProfileResponseDTO getProfileByEmail(String email);

//    UserProfileResponseDTO updateProfile(String email, UpdateProfileRequestDTO request);

    UserProfileResponseDTO getProfileById(Long userId);

    PagedResponse<UserProfileResponseDTO> searchProfiles(String keyword, int page, int size, String sortBy);

    UserProfileResponseDTO updateProfileById(Long userId, UpdateProfileRequestDTO request);
}
