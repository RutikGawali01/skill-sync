package com.rutik.skill_sync_backend.match.entity;

import com.rutik.skill_sync_backend.match.enums.MatchType;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches",
        indexes = {
                @Index(name = "idx_user_a", columnList = "userA_id"),
                @Index(name = "idx_user_b", columnList = "userB_id")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A <-> B match
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userA_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userB_id", nullable = false)
    private User userB;

    // Matching Score
    @Column(nullable = false)
    private Double score;

    @Enumerated(EnumType.STRING)
    private MatchType type; // PERFECT_EXCHANGE, PARTIAL

    private Boolean mutual;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}