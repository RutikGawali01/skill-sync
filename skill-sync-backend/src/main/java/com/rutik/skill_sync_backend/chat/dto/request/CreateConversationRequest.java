package com.rutik.skill_sync_backend.chat.dto.request;

import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO to create a new Conversation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @Builder.Default
    private ConversationType type = ConversationType.DIRECT;
}
