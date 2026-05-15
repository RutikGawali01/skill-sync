package com.rutik.skill_sync_backend.review.service.interfaces;


import com.rutik.skill_sync_backend.review.dto.response.UserTrustScoreResponseDto;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.user.entity.User;

public interface UserTrustScoreService {

    void updateTrustMetrics(User user, Review review);



    UserTrustScoreResponseDto getUserTrustScore(
            Long userId
    );
}