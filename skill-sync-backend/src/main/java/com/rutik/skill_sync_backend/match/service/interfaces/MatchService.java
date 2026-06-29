package com.rutik.skill_sync_backend.match.service.interfaces;


import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.dto.MatchResponseDto;

import java.util.List;

public interface MatchService {

    List<MatchResponseDto> findMatches(Long userId);

    List<MatchResponseDTO> findBasicMatches(Long userId);

    List<MatchResponseDTO> findMutualMatches(Long userId);
}