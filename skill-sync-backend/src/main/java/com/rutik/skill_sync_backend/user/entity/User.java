package com.rutik.skill_sync_backend.user.entity;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.user.enums.AuthProvider;
import com.rutik.skill_sync_backend.user.enums.ExperienceLevel;
import com.rutik.skill_sync_backend.user.enums.Role;
import jakarta.persistence.*;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

import java.time.LocalDateTime;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @Column(length = 1000)
    private String bio;

    private Double rating = 0.0;

    private Integer completedSessions = 0;

    // Security fields (IMPORTANT 🔥) for admin
    private boolean isActive = true;
    private boolean isVerified = false; // email verification

    @Enumerated(EnumType.STRING)
    private Role role;

    // OAuth users may not have password
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    private String profilePicUrl;

    // Audit fields (industry standard)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Auto set timestamps
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    private Integer tokenVersion = 0;

    private Boolean isProfileComplete = false;

    // 🔹 Many-to-Many via join table
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserSkill> userSkills;

    @JsonIgnore
    @OneToMany(mappedBy = "requester")
    private List<Session> requestedSessions;

    @JsonIgnore
    @OneToMany(mappedBy = "provider")
    private List<Session> providedSessions;

}