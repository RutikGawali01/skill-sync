package com.rutik.skill_sync_backend.skill.service;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    @Override
    public void addSkill(Long userId, UserSkillRequestDTO request) {


        log.info("➡️ addSkill called with userId: {} and request: {}", userId, request);

        // 🔹 Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("❌ User not found with id: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        log.info("✅ User found: {}", user.getEmail());

        // 🔹 Fetch skill
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> {
                    log.error("❌ Skill not found with id: {}", request.getSkillId());
                    return new ResourceNotFoundException("Skill not found");
                });

        log.info("✅ Skill found: {}", skill.getName());

        // 🔹 Check duplicate
        userSkillRepository.findByUserIdAndSkillIdAndType(userId, skill.getId(), request.getType())
                .ifPresent(us -> {
                    log.error("❌ Duplicate skill detected for userId: {} skillId: {} type: {}",
                            userId, skill.getId(), request.getType());
                    throw new BadRequestException("Skill already added");
                });

        // 🔹 Create entity
        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .type(request.getType())
                .level(request.getLevel())
                .isVisible(true) // ✅ FIX
                .build();

        log.info("💾 Saving UserSkill: {}", userSkill);

        userSkillRepository.save(userSkill);

        log.info("✅ Skill successfully added for userId: {}", userId);
    }


    @Override
    public void removeSkill(Long userId, Long skillId, SkillType type) {

        log.info("➡️ Removing skill: userId={}, skillId={}, type={}", userId, skillId, type);

        UserSkill userSkill = userSkillRepository
                .findByUserIdAndSkillIdAndType(userId, skillId, type)
                .orElseThrow(() -> {
                    log.error("❌ UserSkill NOT FOUND");
                    return new ResourceNotFoundException("User skill not found");
                });

        log.info("✅ Found UserSkill: {}", userSkill.getId());

        userSkillRepository.delete(userSkill);

        log.info("✅ Deleted successfully");
    }

    @Override
    public List<UserSkillResponseDTO> getUserSkills(Long userId) {

        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<UserSkillResponseDTO> getUserSkillsByType(Long userId, SkillType type) {

        return userSkillRepository.findByUserIdAndType(userId, type)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private UserSkillResponseDTO mapToDTO(UserSkill us) {
        return UserSkillResponseDTO.builder()
                .id(us.getId())
                .skillId(us.getSkill().getId())
                .skillName(us.getSkill().getName())
                .type(us.getType())
                .level(us.getLevel())
                .build();
    }

}