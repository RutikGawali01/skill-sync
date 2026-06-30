package com.rutik.skill_sync_backend.skill.entity;

import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===============================
    // RELATIONSHIPS
    // ===============================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // ===============================
    // SKILL INFO
    // ===============================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillType type;
    // OFFER / WANT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillLevel level;
    // BEGINNER / INTERMEDIATE / ADVANCED

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private Boolean isVisible = true;

    // ===============================
    // VERIFICATION
    // ===============================

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verification_score")
    private Double verificationScore;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "last_test_attempt_at")
    private LocalDateTime lastTestAttemptAt;

    @Column(name = "verification_attempts")
    @Builder.Default
    private Integer verificationAttempts = 0;

    private LocalDateTime lastVerificationFailedAt;

    private LocalDateTime retryAvailableAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
