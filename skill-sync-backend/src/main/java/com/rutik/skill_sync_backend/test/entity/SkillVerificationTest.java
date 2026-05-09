package com.rutik.skill_sync_backend.test.entity;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.test.enums.TestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "skill_verification_tests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillVerificationTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ====================================
    // RELATIONSHIP
    // ====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_skill_id", nullable = false)
    private UserSkill userSkill;

    // ====================================
    // TEST INFO
    // ====================================

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer durationInMinutes;

    @Column(nullable = false)
    private Double passingPercentage;

    @Builder.Default
    @Column(nullable = false)
    private Double scorePercentage = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestStatus status;

    // ====================================
    // TIMESTAMPS
    // ====================================

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime expiresAt;

    // ====================================
    // QUESTIONS
    // ====================================

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL)
    private List<TestQuestion> questions;
}
