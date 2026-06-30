package com.rutik.skill_sync_backend.user.repository;

import com.rutik.skill_sync_backend.user.entity.User;

import java.util.Optional;
import java.util.List;

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

    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.userSkills us
        WHERE us.type = com.rutik.skill_sync_backend.skill.enums.SkillType.OFFER
        AND us.skill.id IN :wantSkillIds
        AND u.id <> :currentUserId
        AND u.isActive = true
        AND u.id NOT IN (
            SELECT DISTINCT s.provider.id FROM Session s
            WHERE s.requester.id = :currentUserId
            AND s.status IN (com.rutik.skill_sync_backend.session.enums.SessionStatus.PENDING, com.rutik.skill_sync_backend.session.enums.SessionStatus.ACCEPTED)
        )
        AND u.id NOT IN (
            SELECT DISTINCT s.requester.id FROM Session s
            WHERE s.provider.id = :currentUserId
            AND s.status IN (com.rutik.skill_sync_backend.session.enums.SessionStatus.PENDING, com.rutik.skill_sync_backend.session.enums.SessionStatus.ACCEPTED)
        )
    """)
    List<User> findCandidatesForMatching(
        @Param("wantSkillIds") List<Long> wantSkillIds,
        @Param("currentUserId") Long currentUserId
    );

    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.userSkills us
        WHERE us.type = com.rutik.skill_sync_backend.skill.enums.SkillType.OFFER
        AND us.skill.id IN :wantSkillIds
        AND u.id <> :currentUserId
        AND u.isActive = true
        AND (
            LOWER(us.skill.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(str(us.skill.category)) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND u.id NOT IN (
            SELECT DISTINCT s.provider.id FROM Session s
            WHERE s.requester.id = :currentUserId
            AND s.status IN (com.rutik.skill_sync_backend.session.enums.SessionStatus.PENDING, com.rutik.skill_sync_backend.session.enums.SessionStatus.ACCEPTED)
        )
        AND u.id NOT IN (
            SELECT DISTINCT s.requester.id FROM Session s
            WHERE s.provider.id = :currentUserId
            AND s.status IN (com.rutik.skill_sync_backend.session.enums.SessionStatus.PENDING, com.rutik.skill_sync_backend.session.enums.SessionStatus.ACCEPTED)
        )
    """)
    List<User> findCandidatesForMatchingWithSearch(
        @Param("wantSkillIds") List<Long> wantSkillIds,
        @Param("currentUserId") Long currentUserId,
        @Param("search") String search
    );
}
