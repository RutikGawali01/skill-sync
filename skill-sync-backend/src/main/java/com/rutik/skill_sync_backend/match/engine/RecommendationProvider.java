package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RecommendationProvider {
    Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable);
}
