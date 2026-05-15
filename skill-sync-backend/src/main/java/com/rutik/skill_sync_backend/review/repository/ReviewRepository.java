package com.rutik.skill_sync_backend.review.repository;

import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewee(User reviewee);

    List<Review> findBySession(Session session);

    boolean existsBySessionAndReviewerAndReviewee(
            Session session,
            User reviewer,
            User reviewee
    );

    Optional<Review> findBySessionAndReviewerAndReviewee(
            Session session,
            User reviewer,
            User reviewee
    );
}
