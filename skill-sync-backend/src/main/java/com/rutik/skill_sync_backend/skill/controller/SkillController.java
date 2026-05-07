package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.SkillResponseDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {
    //Master skill catalog

    private final SkillService skillService;

    // ✅ Get all/search skills

    @GetMapping
    public ApiResponse<List<SkillResponseDTO>> getAllSkills(
            @RequestParam(required = false) String keyword
    ) {

        return ApiResponse.success(
                "Skills fetched successfully",
                skillService.getAllSkills(keyword)
        );
    }

}