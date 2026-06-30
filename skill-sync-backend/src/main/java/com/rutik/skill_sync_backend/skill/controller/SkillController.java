package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.common.dto.PageResponse;
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
    public ResponseEntity<ApiResponse<PageResponse<ExploreSkillResponseDto>>> getExploreSkills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {

        PageResponse<ExploreSkillResponseDto> skills =
                skillService.getExploreSkills(page, size, search, sortBy, sortDir);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Explore skills fetched successfully",
                        skills
                )
        );
    }

}