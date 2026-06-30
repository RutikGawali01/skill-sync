package com.rutik.skill_sync_backend.match.service.interfaces;


import com.rutik.skill_sync_backend.common.dto.PageResponse;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;

import java.util.List;

public interface MatchService {

    List<MatchResponseDTO> findMatches(Long userId);

    List<MatchResponseDTO> findBasicMatches(Long userId);

    PageResponse<MatchResponseDTO> findMutualMatches(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    );

    PageResponse<RecommendationDTO> getRecommendations(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    );

    PageResponse<RecommendationDTO> getRankedMatches(
            Long userId,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    );
}