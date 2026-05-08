package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.skill.dto.*;
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


//    in this api = future enhancement -
//   Show BEST MATCH ONLY ---- Future intelligent approach.
    // wants to learn - should be selected  based on current logged-in user's OFFER skills
//    this can be integrated after matching engine
    @GetMapping("/explore")
    public ResponseEntity<ApiResponse<List<ExploreSkillResponseDto>>> getExploreSkills() {

        List<ExploreSkillResponseDto> skills =
                skillService.getExploreSkills();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Explore skills fetched successfully",
                        skills
                )
        );
    }

}