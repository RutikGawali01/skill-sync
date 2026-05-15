package com.rutik.skill_sync_backend.review.controller;


import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.review.dto.response.UserTrustScoreResponseDto;
import com.rutik.skill_sync_backend.review.service.interfaces.UserTrustScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trust")
@RequiredArgsConstructor
public class TrustController {

    private final UserTrustScoreService trustScoreService;

    // ==========================================
    // GET USER TRUST SCORE
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<UserTrustScoreResponseDto>>
    getUserTrustScore(
            @PathVariable Long userId
    ) {

        UserTrustScoreResponseDto response =
                trustScoreService.getUserTrustScore(
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trust score fetched successfully",
                        response
                )
        );
    }
}
