package com.rutik.skill_sync_backend.chat.entity;

import com.rutik.skill_sync_backend.chat.enums.MessageStatus;
import com.rutik.skill_sync_backend.chat.enums.MessageType;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.session.entity.Session;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA entity representing a Message inside a Conversation.
 */
@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_message_conversation_created", columnList = "conversation_id, createdAt")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = true)
    private Session session;

    @Column(name = "client_message_id", unique = true)
    private String clientMessageId;

    @Column(nullable = false, length = 4000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean edited = false;

    private LocalDateTime editedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.type == null) {
            this.type = MessageType.TEXT;
        }
        if (this.status == null) {
            this.status = MessageStatus.SENT;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}