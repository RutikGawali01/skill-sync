package com.rutik.skill_sync_backend.match.repository;

import com.rutik.skill_sync_backend.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByUserAId(Long userId);

    List<Match> findByUserBId(Long userId);
}
