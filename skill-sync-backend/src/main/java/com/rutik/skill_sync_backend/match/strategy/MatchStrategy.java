package com.rutik.skill_sync_backend.match.strategy;

import com.rutik.skill_sync_backend.match.dto.MatchResponseDTO;
import com.rutik.skill_sync_backend.match.model.MatchStrategyContext;

import java.util.List;

public interface MatchStrategy {
    List<MatchResponseDTO> match(MatchStrategyContext context);
    boolean supports(String strategyName);
}
