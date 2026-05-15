package com.rutik.skill_sync_backend.review.entity;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_trust_scores",
        indexes = {
                @Index(name = "idx_user_trust_user", columnList = "user_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // USER
    // ==========================================

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ==========================================
    // REVIEW METRICS
    // ==========================================

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Integer totalRatingSum = 0;

    // ==========================================
    // SESSION METRICS
    // ==========================================

    @Builder.Default
    private Integer completedSessions = 0;

    @Builder.Default
    private Integer cancelledSessions = 0;

    @Builder.Default
    private Double completionRate = 0.0;

    // ==========================================
    // TRUST SCORE
    // ==========================================

    @Builder.Default
    private Double trustScore = 0.0;

    // ==========================================
    // AUDIT
    // ==========================================

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {

        this.updatedAt = LocalDateTime.now();
    }
}