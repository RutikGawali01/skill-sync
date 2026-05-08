package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.skill.dto.UserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.service.SkillService;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users/skills")
@RequiredArgsConstructor
public class UserSkillController {

    private final SkillService skillService;

    // ✅ Add Skill
    @PostMapping
    public ApiResponse<UserSkillResponseDTO> addSkill(
            @Valid @RequestBody UserSkillRequestDTO request,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        UserSkillResponseDTO response =
                skillService.addSkill(user.getId(), request);

        return ApiResponse.success(
                "Skill added successfully",
                response
        );
    }

    // ✅ Remove Skill
    @DeleteMapping
    public ApiResponse<Void> removeSkill(
            @RequestParam Long skillId,
            @RequestParam SkillType type,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        skillService.removeSkill(user.getId(), skillId, type);

        return ApiResponse.success(
                "Skill removed successfully"
        );
    }

    // ✅ Get Current User Skills
    @GetMapping
    public ApiResponse<List<UserSkillResponseDTO>> getMySkills(
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        return ApiResponse.success(
                "User skills fetched",
                skillService.getUserSkills(user.getId())
        );
    }

    // ✅ Filter Skills By Type
    @GetMapping("/filter")
    public ApiResponse<List<UserSkillResponseDTO>> getSkillsByType(
            @RequestParam SkillType type,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        return ApiResponse.success(
                "Filtered skills fetched",
                skillService.getUserSkillsByType(user.getId(), type)
        );
    }
}