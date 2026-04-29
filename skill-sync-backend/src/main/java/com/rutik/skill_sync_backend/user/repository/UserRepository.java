package com.rutik.skill_sync_backend.user.repository;

import com.rutik.skill_sync_backend.user.entity.User;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Used for OAuth
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    Optional<User> findByIdAndIsActiveTrue(Long id);


    Optional<User> findById(Long id);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
