package com.rutik.skill_sync_backend.chat.dto.response;

import com.rutik.skill_sync_backend.chat.enums.MessageStatus;
import com.rutik.skill_sync_backend.chat.enums.MessageType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO representing a Message response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long sessionId;
    private String clientMessageId;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageType type;
    private MessageStatus status;
    private LocalDateTime createdAt;
}
