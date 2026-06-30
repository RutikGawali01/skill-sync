package com.rutik.skill_sync_backend.chat.entity;

import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA entity representing a participant in a Conversation.
 */
@Entity
@Table(
    name = "conversation_participants",
    uniqueConstraints = {
        @UniqueConstraint(name = "uc_conversation_user", columnNames = {"conversation_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_participant_user_archived", columnList = "user_id, archived"),
        @Index(name = "idx_participant_conversation", columnList = "conversation_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    private Long lastReadMessageId;

    @Column(nullable = false)
    @Builder.Default
    private Integer unreadCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean muted = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Version
    private Long version;

    @PrePersist
    public void onCreate() {
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
        if (this.unreadCount == null) {
            this.unreadCount = 0;
        }
    }
}
