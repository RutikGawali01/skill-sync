package com.rutik.skill_sync_backend.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadReceiptRequest {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotNull(message = "Message ID is required")
    private Long messageId;
}
