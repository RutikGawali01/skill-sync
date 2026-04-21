package com.rutik.skill_sync_backend.skill.entity;

import com.rutik.skill_sync_backend.skill.enums.SkillLevel;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillType type;
    // OFFER / WANT

    @Column(nullable = false)
    private Boolean isVisible = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillLevel level;
    // Beginner / Intermediate / Expert
}