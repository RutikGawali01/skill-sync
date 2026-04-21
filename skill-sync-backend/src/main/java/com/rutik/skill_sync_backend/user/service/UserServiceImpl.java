package com.rutik.skill_sync_backend.user.service;


import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.dto.UpdateProfileRequestDTO;
import com.rutik.skill_sync_backend.user.dto.UserProfileResponseDTO;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.enums.ExperienceLevel;
import com.rutik.skill_sync_backend.user.mapper.UserMapper;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO request) {
//        System.out.println(2);
        if (request == null) {
            throw new RuntimeException("Request body is missing");
        }


        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

//        System.out.println(user);
        user.setBio(request.getBio());
        user.setProfilePicUrl(request.getProfilePicUrl());
        user.setIsProfileComplete(true);

//        System.out.println(3);
        userRepository.save(user);

//        System.out.println(4);
        return UserMapper.toDTO(user);
    }

    @Override
    public UserProfileResponseDTO getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserMapper.toDTO(user);
    }
}