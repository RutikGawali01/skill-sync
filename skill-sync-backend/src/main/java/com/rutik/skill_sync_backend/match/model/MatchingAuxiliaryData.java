package com.rutik.skill_sync_backend.match.model;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class MatchingAuxiliaryData {
    private final Map<Long, Double> trustScores;
    private final Map<Long, List<Availability>> availabilitySlots;
}
