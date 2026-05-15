package com.rutik.skill_sync_backend.skill.service;

import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.skill.dto.*;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.mapper.UserSkillMapper;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    /**
     * ✅ Add skill to current user
     */
    @Override
    public UserSkillResponseDTO addSkill(
            Long userId,
            UserSkillRequestDTO request
    ) {

        log.info(
                "➡️ addSkill called with userId: {} and request: {}",
                userId,
                request
        );

        // ✅ Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {

                    log.error(
                            "❌ User not found with id: {}",
                            userId
                    );

                    return new ResourceNotFoundException(
                            "User not found"
                    );
                });

        log.info("✅ User found: {}", user.getEmail());

        // ✅ Fetch skill
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> {

                    log.error(
                            "❌ Skill not found with id: {}",
                            request.getSkillId()
                    );

                    return new ResourceNotFoundException(
                            "Skill not found"
                    );
                });

        log.info("✅ Skill found: {}", skill.getName());

        // ✅ Prevent duplicate skills
        userSkillRepository
                .findByUserIdAndSkillIdAndType(
                        userId,
                        skill.getId(),
                        request.getType()
                )
                .ifPresent(existingSkill -> {

                    log.error(
                            "❌ Duplicate skill detected for userId: {} skillId: {} type: {}",
                            userId,
                            skill.getId(),
                            request.getType()
                    );

                    throw new BadRequestException(
                            "Skill already added"
                    );
                });

        // ✅ Create UserSkill entity
        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .type(request.getType())
                .level(request.getLevel())
                .isVisible(true)
                .build();

        log.info("💾 Saving UserSkill");

        // ✅ Save
        UserSkill savedUserSkill =
                userSkillRepository.save(userSkill);

        log.info(
                "✅ Skill successfully added for userId: {}",
                userId
        );

        // ✅ Return response DTO
        return mapToDTO(savedUserSkill);
    }

    /**
     * ✅ Remove skill from user
     */
    @Override
    public void removeSkill(
            Long userId,
            Long skillId,
            SkillType type
    ) {

        log.info(
                "➡️ Removing skill: userId={}, skillId={}, type={}",
                userId,
                skillId,
                type
        );

        UserSkill userSkill = userSkillRepository
                .findByUserIdAndSkillIdAndType(
                        userId,
                        skillId,
                        type
                )
                .orElseThrow(() -> {

                    log.error("❌ UserSkill not found");

                    return new ResourceNotFoundException(
                            "User skill not found"
                    );
                });

        userSkillRepository.delete(userSkill);

        log.info("✅ Skill removed successfully");
    }

    /**
     * ✅ Get all skills of user
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserSkillResponseDTO> getUserSkills(
            Long userId
    ) {

        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(UserSkillMapper::mapToDto)
                .toList();
    }


    /**
     * ✅ Get user skills by type
     * Example:
     * OFFER / WANT
     */
    @Override
    public List<UserSkillResponseDTO> getUserSkillsByType(
            Long userId,
            SkillType type
    ) {

        log.info(
                "➡️ Fetching {} skills for userId: {}",
                type,
                userId
        );

        return userSkillRepository
                .findByUserIdAndType(userId, type)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * ✅ Get all available skills
     * Used for searchable dropdown in frontend
     */
    @Override
    public List<SkillResponseDTO> getAllSkills(String keyword) {

        log.info(
                "➡️ Fetching skills with keyword: {}",
                keyword
        );

        List<Skill> skills;

        // ✅ Fetch all skills
        if (keyword == null || keyword.isBlank()) {

            skills = skillRepository.findAll();

        } else {

            // ✅ Search skills
            skills = skillRepository
                    .findByNameContainingIgnoreCase(keyword);
        }

        return skills.stream()
                .map(skill -> SkillResponseDTO.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .category(skill.getCategory())
                        .build())
                .toList();
    }

    /**
     * ✅ Mapper method
     */
    private UserSkillResponseDTO mapToDTO(UserSkill userSkill) {

        return UserSkillResponseDTO.builder()
                .id(userSkill.getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getName())
                .type(userSkill.getType())
                .level(userSkill.getLevel())
                .build();
    }

    @Override
    public List<ExploreSkillResponseDto> getExploreSkills() {

        List<UserSkill> offeredSkills =
                userSkillRepository.findByType(SkillType.OFFER);

        return offeredSkills.stream()
                .filter(userSkill -> Boolean.TRUE.equals(userSkill.getIsVisible()))
                .map(this::mapToExploreDto)
                .toList();
    }

    private ExploreSkillResponseDto mapToExploreDto(
            UserSkill userSkill
    ) {

        User user = userSkill.getUser();

        return ExploreSkillResponseDto.builder()

                // ==========================================
                // USER SKILL ID
                // ==========================================

                .userSkillId(userSkill.getId())

                // ==========================================
                // SKILL INFO
                // ==========================================

                .skillName(
                        userSkill.getSkill().getName()
                )

                .skillLevel(
                        userSkill.getLevel()
                )

                .category(
                        userSkill.getSkill()
                                .getCategory()
                                .name()
                )

                .skillId(
                        userSkill.getSkill().getId()
                )

                .isVerified(
                        Boolean.TRUE.equals(
                                userSkill.getIsVerified()
                        )
                )

                // ==========================================
                // USER INFO
                // ==========================================

                .userId(user.getId())

                .fullName(user.getName())

                .profilePicture(
                        user.getProfilePicUrl()
                )

                // ==========================================
                // TRUST SIGNALS
                // ==========================================

                .rating(user.getRating())

                .completedSessions(
                        user.getCompletedSessions()
                )

                // ==========================================
                // EXCHANGE CONTEXT
                // ==========================================

                .wantsToLearn(
                        getWantedSkills(user)
                )

                // ==========================================
                // PROVIDER AVAILABILITY
                // ==========================================

                .availability(
                        getProviderAvailability(user)
                )

                .build();
    }


    private List<String> getWantedSkills(User user) {

        return user.getUserSkills().stream()

                // Only WANT skills
                .filter(skill -> skill.getType() == SkillType.WANT)

                // Only visible skills
                .filter(skill -> Boolean.TRUE.equals(skill.getIsVisible()))

                // Convert to skill names
                .map(skill -> skill.getSkill().getName())

                // Avoid duplicate skill names
                .distinct()

                // Limit for clean UI
                .limit(3)

                .toList();
    }

    private List<AvailabilityResponseDTO> getProviderAvailability(
            User user
    ) {
        if (user.getAvailabilitySlots() == null) {
            return List.of();
        }
        return user.getAvailabilitySlots().stream()
                .map(slot -> AvailabilityResponseDTO.builder()
                        .id(slot.getId())
                        .day(slot.getDay())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VerifiedBadgeResponseDto> getVerifiedBadges(
            Long userId
    ) {

        List<UserSkill> verifiedSkills =
                userSkillRepository
                        .findByUserIdAndIsVerifiedTrue(userId);

        return verifiedSkills.stream()
                .map(skill -> VerifiedBadgeResponseDto.builder()

                        .skillId(skill.getSkill().getId())

                        .skillName(skill.getSkill().getName())

                        .verificationScore(
                                skill.getVerificationScore()
                        )

                        .verifiedAt(
                                skill.getVerifiedAt()
                        )

                        .build())

                .toList();
    }
}