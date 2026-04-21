package com.rutik.skill_sync_backend.match.repository;

import com.rutik.skill_sync_backend.match.entity.SavedMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedMatchRepository extends JpaRepository<SavedMatch, Long> {

    Optional<SavedMatch> findByUserIdAndMatchedUserId(Long userId, Long matchedUserId);

    List<SavedMatch> findByUserId(Long userId);
}