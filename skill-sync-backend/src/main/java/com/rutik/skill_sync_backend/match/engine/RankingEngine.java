package com.rutik.skill_sync_backend.match.engine;

import com.rutik.skill_sync_backend.match.dto.RecommendationDTO;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
public class RankingEngine {

    public List<RecommendationDTO> rank(List<RecommendationDTO> recommendations, Map<Long, User> candidateMap) {
        if (recommendations == null) {
            return List.of();
        }

        return recommendations.stream()
                .sorted(new Comparator<RecommendationDTO>() {
                    @Override
                    public int compare(RecommendationDTO r1, RecommendationDTO r2) {
                        // 1. Overall Score (descending)
                        int cmp = Double.compare(r2.getMatchScore().getOverallScore(), r1.getMatchScore().getOverallScore());
                        if (cmp != 0) return cmp;

                        // 2. Trust Score (descending)
                        cmp = Double.compare(r2.getMatchScore().getBreakdown().getTrustScore(), r1.getMatchScore().getBreakdown().getTrustScore());
                        if (cmp != 0) return cmp;

                        // 3. Rating (descending)
                        cmp = Double.compare(r2.getCandidate().getRating(), r1.getCandidate().getRating());
                        if (cmp != 0) return cmp;

                        // 4. Completed Sessions (descending)
                        cmp = Integer.compare(r2.getCandidate().getCompletedSessions(), r1.getCandidate().getCompletedSessions());
                        if (cmp != 0) return cmp;

                        // Retrieve full User entities to compare dates
                        User u1 = candidateMap.get(r1.getCandidate().getId());
                        User u2 = candidateMap.get(r2.getCandidate().getId());

                        // 5. Recent Activity (descending based on updatedAt)
                        LocalDateTime act1 = (u1 != null && u1.getUpdatedAt() != null) ? u1.getUpdatedAt() : LocalDateTime.MIN;
                        LocalDateTime act2 = (u2 != null && u2.getUpdatedAt() != null) ? u2.getUpdatedAt() : LocalDateTime.MIN;
                        cmp = act2.compareTo(act1);
                        if (cmp != 0) return cmp;

                        // 6. Registration Date (ascending, older users first for deterministic stability)
                        LocalDateTime c1 = (u1 != null && u1.getCreatedAt() != null) ? u1.getCreatedAt() : LocalDateTime.MIN;
                        LocalDateTime c2 = (u2 != null && u2.getCreatedAt() != null) ? u2.getCreatedAt() : LocalDateTime.MIN;
                        cmp = c1.compareTo(c2);
                        if (cmp != 0) return cmp;

                        // Deterministic fallback: User ID (ascending)
                        return r1.getCandidate().getId().compareTo(r2.getCandidate().getId());
                    }
                })
                .toList();
    }
}
