package com.rutik.skill_sync_backend.review.entity;

import com.rutik.skill_sync_backend.review.enums.ReviewStatus;
import com.rutik.skill_sync_backend.review.enums.ReviewType;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

import java.time.LocalDateTime;


import jakarta.persistence.*;
        import lombok.*;

        import java.time.LocalDateTime;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "session_id",
                                "reviewer_id",
                                "reviewee_id"
                        }
                )
        },
        indexes = {
                @Index(name = "idx_review_reviewee", columnList = "reviewee_id"),
                @Index(name = "idx_review_session", columnList = "session_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // SESSION REFERENCE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // ==========================================
    // REVIEW PARTICIPANTS
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    // ==========================================
    // REVIEW RATINGS
    // ==========================================

    @Column(nullable = false)
    private Integer overallRating;

    @Column(nullable = false)
    private Integer teachingRating;

    @Column(nullable = false)
    private Integer communicationRating;

    @Column(nullable = false)
    private Integer punctualityRating;

    @Column(nullable = false)
    private Integer knowledgeRating;

    // ==========================================
    // REVIEW CONTENT
    // ==========================================

    @Column(length = 1000)
    private String feedback;

    // ==========================================
    // REVIEW TYPE
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewType reviewType;

    // ==========================================
    // MODERATION
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;

    @Builder.Default
    private Boolean moderated = false;

    @Builder.Default
    private Boolean visible = true;

    // ==========================================
    // AUDIT
    // ==========================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }
}