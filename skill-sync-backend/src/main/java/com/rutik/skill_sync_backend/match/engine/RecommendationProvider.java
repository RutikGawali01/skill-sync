package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import com.rutik.skill_sync_backend.common.dto.PageResponse;

public interface RecommendationProvider {
    PageResponse<RecommendationDTO> getRecommendations(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    );
}
