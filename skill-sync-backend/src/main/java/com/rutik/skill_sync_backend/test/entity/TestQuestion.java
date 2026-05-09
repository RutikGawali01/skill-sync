package com.rutik.skill_sync_backend.test.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ====================================
    // RELATIONSHIP
    // ====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private SkillVerificationTest test;

    // ====================================
    // QUESTION DATA
    // ====================================

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(nullable = false)
    private String optionA;

    @Column(nullable = false)
    private String optionB;

    @Column(nullable = false)
    private String optionC;

    @Column(nullable = false)
    private String optionD;

    // NEVER SEND TO FRONTEND
    @Column(nullable = false)
    private String correctAnswer;
}
