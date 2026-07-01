package com.rutik.skill_sync_backend.chat.dto.request;

import com.rutik.skill_sync_backend.chat.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO to send a chat message.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    private String clientMessageId;

    @NotBlank(message = "Message content cannot be blank")
    private String content;

    private MessageType type; // Can default to TEXT if null
}
