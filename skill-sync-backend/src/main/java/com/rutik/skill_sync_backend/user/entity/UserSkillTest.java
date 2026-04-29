package com.rutik.skill_sync_backend.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_skill_tests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private String skillName;

    private Integer score;
    private Integer totalQuestions;
    private Boolean isPassed;

    private String testStatus;

    private Long expiresAt;
}
