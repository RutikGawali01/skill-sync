package com.rutik.skill_sync_backend.user.mapper;

import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;
import com.rutik.skill_sync_backend.user.entity.User;

public class UserMapper {

    public static UserProfileResponseDTO toDTO(User user) {

        if (user == null) {
            throw new RuntimeException("User is null in mapper");
        }
//        System.out.println(5);

        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePicUrl(user.getProfilePicUrl())
                .build();
    }
}