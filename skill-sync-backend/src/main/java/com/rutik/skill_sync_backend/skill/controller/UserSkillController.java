package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.skill.dto.UserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users/{userId}/skills")
@RequiredArgsConstructor
public class UserSkillController {

    private final SkillService userSkillService;

    // ✅ Add Skill
    @PostMapping
    public ApiResponse<Void> addSkill(
            @PathVariable Long userId,
            @Valid @RequestBody UserSkillRequestDTO request
    ) {
        log.info("📥 Controller HIT → userId: {}, request: {}", userId, request);

        userSkillService.addSkill(userId, request);

        log.info("📤 Skill added successfully");

        return ApiResponse.success("Skill added successfully");
    }

    // ✅ Remove Skill
    @DeleteMapping
    public ApiResponse<Void> removeSkill(
            @PathVariable Long userId,
            @RequestParam Long skillId,
            @RequestParam SkillType type
    ) {
        userSkillService.removeSkill(userId, skillId, type);
        return ApiResponse.success("Skill removed successfully");
    }

    // ✅ Get All Skills
    @GetMapping
    public ApiResponse<List<UserSkillResponseDTO>> getAllSkills(
            @PathVariable Long userId
    ) {
        return ApiResponse.success(
                "User skills fetched",
                userSkillService.getUserSkills(userId)
        );
    }

    // ✅ Filter by type
    @GetMapping("/filter")
    public ApiResponse<List<UserSkillResponseDTO>> getSkillsByType(
            @PathVariable Long userId,
            @RequestParam SkillType type
    ) {
        return ApiResponse.success(
                "Filtered skills fetched",
                userSkillService.getUserSkillsByType(userId, type)
        );
    }
}
