package com.rutik.skill_sync_backend.match.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.service.interfaces.MatchService;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.rutik.skill_sync_backend.common.dto.PageResponse;
import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/{userId}")
    public ApiResponse<List<MatchResponseDTO>> getMatches(@PathVariable Long userId) {

        List<MatchResponseDTO> matches = matchService.findMatches(userId);

        return ApiResponse.success("Matches fetched successfully", matches);
    }

    @GetMapping("/basic")
    public ApiResponse<List<MatchResponseDTO>> getBasicMatches(Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        List<MatchResponseDTO> matches = matchService.findBasicMatches(currentUser.getId());
        return ApiResponse.success("Basic matches fetched successfully", matches);
    }

    @GetMapping("/mutual")
    public ApiResponse<PageResponse<MatchResponseDTO>> getMutualMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "matchScore") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication auth
    ) {
        User currentUser = (User) auth.getPrincipal();
        PageResponse<MatchResponseDTO> matches = matchService.findMutualMatches(
                currentUser.getId(), page, size, search, sortBy, sortDir
        );
        return ApiResponse.success("Mutual matches fetched successfully", matches);
    }

    @GetMapping({"/recommendations", "/recommended"})
    public ApiResponse<PageResponse<RecommendationDTO>> getRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "matchScore") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication auth
    ) {
        User currentUser = (User) auth.getPrincipal();
        PageResponse<RecommendationDTO> recommendations = matchService.getRecommendations(
                currentUser.getId(), page, size, search, sortBy, sortDir
        );
        return ApiResponse.success("Recommendations fetched successfully", recommendations);
    }

    @GetMapping("/ranked")
    public ApiResponse<PageResponse<RecommendationDTO>> getRankedMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "matchScore") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication auth
    ) {
        User currentUser = (User) auth.getPrincipal();
        PageResponse<RecommendationDTO> ranked = matchService.getRankedMatches(
                currentUser.getId(), page, size, search, sortBy, sortDir
        );
        return ApiResponse.success("Ranked matches fetched successfully", ranked);
    }
}
