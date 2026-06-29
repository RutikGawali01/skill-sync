package com.rutik.skill_sync_backend.match.service.interfaces;


import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MatchService {

    List<MatchResponseDTO> findMatches(Long userId);

    List<MatchResponseDTO> findBasicMatches(Long userId);

    List<MatchResponseDTO> findMutualMatches(Long userId);

    Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable);

    Page<RecommendationDTO> getRankedMatches(Long userId, Pageable pageable);
}