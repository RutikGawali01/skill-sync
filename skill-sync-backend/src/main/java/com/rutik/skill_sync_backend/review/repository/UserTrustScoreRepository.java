package com.rutik.skill_sync_backend.review.repository;

import com.rutik.skill_sync_backend.review.entity.UserTrustScore;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTrustScoreRepository
        extends JpaRepository<UserTrustScore, Long> {

    Optional<UserTrustScore> findByUser(User user);
}
