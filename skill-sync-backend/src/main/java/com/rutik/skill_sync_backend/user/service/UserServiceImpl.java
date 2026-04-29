package com.rutik.skill_sync_backend.user.service;


import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.common.response.PagedResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponseDTO getProfileByEmail(String email) {

//        System.out.println("email of users - "+ email );
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserMapper.toDTO(user);
    }

    @Override
    public UserProfileResponseDTO getProfileById(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserMapper.toDTO(user);
    }

//    @Override
//    public UserProfileResponseDTO updateProfile(String email, UpdateProfileRequestDTO request) {
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        // ✅ BASIC INFO
//        user.setName(request.getName());
//        user.setBio(request.getBio());
//        user.setProfilePicUrl(request.getProfilePicUrl());
//        user.setLocation(request.getLocation());
//        user.setTimezone(request.getTimezone());
//
//        // ✅ MATCHING FIELDS
//        user.setLearningGoal(request.getLearningGoal());
//        user.setGoalTimeline(request.getGoalTimeline());
//        user.setTeachingMotivation(request.getTeachingMotivation());
//        user.setTeachingApproach(request.getTeachingApproach());
//        user.setPreferredLearningMethod(request.getPreferredLearningMethod());
//        user.setCommunicationPace(request.getCommunicationPace());
//        user.setPreferredLanguage(request.getPreferredLanguage());
//        user.setDomainFocus(request.getDomainFocus());
//        user.setHoursPerWeek(request.getHoursPerWeek());
//
//        // ✅ PROFILE COMPLETION FLAG
//        user.setIsProfileComplete(checkProfileCompletion(user));
//
//        userRepository.save(user);
//
//        return UserMapper.toDTO(user);
//    }

    @Override
    public UserProfileResponseDTO updateProfileById(Long userId, UpdateProfileRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // update fields
        user.setName(request.getName());
        user.setBio(request.getBio());
        user.setProfilePicUrl(request.getProfilePicUrl());
        user.setLocation(request.getLocation());
        user.setTimezone(request.getTimezone());

        user.setLearningGoal(request.getLearningGoal());
        user.setGoalTimeline(request.getGoalTimeline());
        user.setTeachingMotivation(request.getTeachingMotivation());
        user.setTeachingApproaches(request.getTeachingApproaches());
        user.setPreferredLearningMethod(request.getPreferredLearningMethod());
        user.setCommunicationPace(request.getCommunicationPace());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setDomainFocus(request.getDomainFocus());
        user.setHoursPerWeek(request.getHoursPerWeek());

        user.setIsProfileComplete(checkProfileCompletion(user));

        userRepository.save(user);

        return UserMapper.toDTO(user);
    }

    @Override
    public PagedResponse<UserProfileResponseDTO> searchProfiles(
            String keyword, int page, int size, String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());

        Page<User> users = userRepository.searchUsers(keyword, pageable);

        List<UserProfileResponseDTO> content = users
                .getContent()
                .stream()
                .map(UserMapper::toDTO)
                .toList();

        return PagedResponse.<UserProfileResponseDTO>builder()
                .content(content)
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .last(users.isLast())
                .build();
    }

    /**
     * ✅ Calculate if profile is complete (boolean version)
     * Used for quick checks (not percentage like repo)
     */
    private boolean checkProfileCompletion(User user) {

        int totalFields = 10; // define what matters for MVP
        int filled = 0;

        // BASIC INFO
        if (user.getName() != null && !user.getName().isBlank()) filled++;
        if (user.getBio() != null && !user.getBio().isBlank()) filled++;
        if (user.getProfilePicUrl() != null) filled++;
        if (user.getLocation() != null) filled++;

        // MATCHING FIELDS (IMPORTANT 🔥)
        if (user.getLearningGoal() != null) filled++;
        if (user.getGoalTimeline() != null) filled++;
        if (user.getPreferredLearningMethod() != null) filled++;
        if (user.getCommunicationPace() != null) filled++;
        if (user.getDomainFocus() != null) filled++;

        // TIME COMMITMENT
        if (user.getHoursPerWeek() != null) filled++;

        // ✅ RULE: 70% fields filled = profile complete
        return ((filled * 100) / totalFields) >= 70;
    }
}