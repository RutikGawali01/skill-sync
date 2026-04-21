package com.rutik.skill_sync_backend.user.repository;

import com.rutik.skill_sync_backend.user.entity.User;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Used for OAuth
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    Optional<User> findByIdAndIsActiveTrue(Long id);


    Optional<User> findById(Long id);
}
