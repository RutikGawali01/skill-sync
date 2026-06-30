package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import com.rutik.skill_sync_backend.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecommendationEngine {

    private final RecommendationProvider recommendationProvider;

    public PageResponse<RecommendationDTO> getRecommendations(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    ) {
        return recommendationProvider.getRecommendations(userId, page, size, search, sortBy, sortDir);
    }
}
