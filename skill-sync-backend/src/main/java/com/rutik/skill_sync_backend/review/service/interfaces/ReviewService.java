package com.rutik.skill_sync_backend.review.service.interfaces;

import com.rutik.skill_sync_backend.review.dto.request.CreateReviewRequestDto;
import com.rutik.skill_sync_backend.review.dto.response.ReviewResponseDto;

import java.util.List;

public interface ReviewService {

    ReviewResponseDto createReview(
            Long reviewerId,
            CreateReviewRequestDto requestDto
    );

    List<ReviewResponseDto> getReviewsByUser(
            Long userId
    );

    List<ReviewResponseDto> getReviewsBySession(
            Long sessionId
    );
}
