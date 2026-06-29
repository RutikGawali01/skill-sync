package com.rutik.skill_sync_backend.match.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDto;
import com.rutik.skill_sync_backend.match.service.interfaces.MatchService;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/{userId}")
    public ApiResponse<List<MatchResponseDto>> getMatches(@PathVariable Long userId) {

        List<MatchResponseDto> matches = matchService.findMatches(userId);

        return ApiResponse.success("Matches fetched successfully", matches);
    }

    @GetMapping("/basic")
    public ApiResponse<List<MatchResponseDTO>> getBasicMatches(Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        List<MatchResponseDTO> matches = matchService.findBasicMatches(currentUser.getId());
        return ApiResponse.success("Basic matches fetched successfully", matches);
    }

    @GetMapping("/mutual")
    public ApiResponse<List<MatchResponseDTO>> getMutualMatches(Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        List<MatchResponseDTO> matches = matchService.findMutualMatches(currentUser.getId());
        return ApiResponse.success("Mutual matches fetched successfully", matches);
    }
}
