package com.rutik.skill_sync_backend.match.entity;

import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import lombok.*;


import jakarta.persistence.*;
        import lombok.*;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User userA;

    @ManyToOne
    private User userB;

    private String skillOfferedByA;
    private String skillWantedByA;

    private Double matchScore;

    private String status; // FOUND, CONNECTED, REJECTED
}