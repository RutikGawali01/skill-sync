package com.rutik.skill_sync_backend.review.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.review.dto.request.CreateReviewRequestDto;
import com.rutik.skill_sync_backend.review.dto.response.ReviewResponseDto;
import com.rutik.skill_sync_backend.review.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ==========================================
    // CREATE REVIEW
    // ==========================================

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponseDto>>
    createReview(
            @AuthenticationPrincipal(expression = "id")
            Long reviewerId,

            @Valid
            @RequestBody
            CreateReviewRequestDto requestDto
    ) {

        ReviewResponseDto response =
                reviewService.createReview(
                        reviewerId,
                        requestDto
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Review submitted successfully",
                        response
                )
        );
    }

    // ==========================================
    // GET USER REVIEWS
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDto>>>
    getReviewsByUser(
            @PathVariable Long userId
    ) {

        List<ReviewResponseDto> response =
                reviewService.getReviewsByUser(
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Reviews fetched successfully",
                        response
                )
        );
    }

    // ==========================================
    // GET SESSION REVIEWS
    // ==========================================

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDto>>>
    getReviewsBySession(
            @PathVariable Long sessionId
    ) {

        List<ReviewResponseDto> response =
                reviewService.getReviewsBySession(
                        sessionId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Session reviews fetched successfully",
                        response
                )
        );
    }

}
