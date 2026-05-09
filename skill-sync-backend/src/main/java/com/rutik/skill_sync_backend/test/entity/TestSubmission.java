package com.rutik.skill_sync_backend.test.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ====================================
    // RELATIONSHIPS
    // ====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private SkillVerificationTest test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private TestQuestion question;

    // ====================================
    // ANSWER
    // ====================================

    @Column(nullable = false)
    private String selectedAnswer;

    @Column(nullable = false)
    private Boolean isCorrect;
}
