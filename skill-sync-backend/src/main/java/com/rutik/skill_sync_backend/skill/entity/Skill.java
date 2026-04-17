package com.rutik.skill_sync_backend.skill.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import lombok.*;

import jakarta.persistence.*;
        import lombok.*;
        import java.util.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category; // DSA, DevOps, Design

    @OneToMany(mappedBy = "skill")
    private List<UserSkill> userSkills;
}