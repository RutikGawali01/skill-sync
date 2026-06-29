package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecommendationEngine {

    private final RecommendationProvider recommendationProvider;

    public Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable) {
        return recommendationProvider.getRecommendations(userId, pageable);
    }
}
