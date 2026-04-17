package com.rutik.skill_sync_backend.user.entity;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;
        import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String bio;

    private String experienceLevel; // Beginner, Intermediate, Expert

    private Double rating = 0.0;

    private Integer completedSessions = 0;

    private Boolean isActive = true;

    // 🔹 Many-to-Many via join table
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserSkill> userSkills;

    @OneToMany(mappedBy = "requester")
    private List<Session> requestedSessions;

    @OneToMany(mappedBy = "provider")
    private List<Session> providedSessions;
}