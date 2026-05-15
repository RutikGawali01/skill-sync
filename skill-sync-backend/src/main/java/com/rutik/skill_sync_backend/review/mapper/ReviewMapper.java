package com.rutik.skill_sync_backend.review.mapper;

import com.rutik.skill_sync_backend.review.dto.response.ReviewResponseDto;
import com.rutik.skill_sync_backend.review.entity.Review;

public class ReviewMapper {

    private ReviewMapper() {
    }

    public static ReviewResponseDto toDto(Review review) {

        return ReviewResponseDto.builder()
                .id(review.getId())
                .sessionId(review.getSession().getId())

                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getName())

                .revieweeId(review.getReviewee().getId())
                .revieweeName(review.getReviewee().getName())

                .overallRating(review.getOverallRating())
                .teachingRating(review.getTeachingRating())
                .communicationRating(review.getCommunicationRating())
                .punctualityRating(review.getPunctualityRating())
                .knowledgeRating(review.getKnowledgeRating())

                .feedback(review.getFeedback())

                .createdAt(review.getCreatedAt())
                .build();
    }
}
