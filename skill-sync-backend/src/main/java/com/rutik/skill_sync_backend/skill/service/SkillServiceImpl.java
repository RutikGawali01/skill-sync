package com.rutik.skill_sync_backend.skill.service;

import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    @Override
    public void addSkill(AddSkillRequestDTO request) {

        // Avoid duplicate skill names
        skillRepository.findByName(request.getName())
                .ifPresent(skill -> {
                    throw new RuntimeException("Skill already exists");
                });

        Skill skill = Skill.builder()
                .name(request.getName())
                .category(request.getCategory())
                .build();

        skillRepository.save(skill);
    }

    @Override
    public void addUserSkill(Long userId, AddUserSkillRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        SkillType type = SkillType.valueOf(request.getType());
        SkillLevel level = SkillLevel.valueOf(request.getLevel());

        // Prevent duplicate mapping
        if (userSkillRepository.existsByUserIdAndSkillIdAndType(
                userId, request.getSkillId(), type
        )) {
            throw new RuntimeException("Skill already added");
        }

        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .type(type)
                .level(level)
                .build();

        userSkillRepository.save(userSkill);
    }

    @Override
    public List<UserSkillResponseDTO> getUserSkills(Long userId) {

        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(us -> UserSkillResponseDTO.builder()
                        .skillName(us.getSkill().getName())
                        .type(us.getType().name())
                        .level(us.getLevel().name())
                        .build())
                .collect(Collectors.toList());
    }
}