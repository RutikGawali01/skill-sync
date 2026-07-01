package com.rutik.skill_sync_backend.chat.entity;

import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA entity representing a Conversation.
 */
@Entity
@Table(
    name = "conversations",
    indexes = {
        @Index(name = "idx_conversation_status", columnList = "status"),
        @Index(name = "idx_conversation_type", columnList = "type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationType type;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "latest_message_id")
    private Message latestMessage;

    @Version
    private Long version;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ConversationStatus.ACTIVE;
        }
        if (this.type == null) {
            this.type = ConversationType.DIRECT;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
