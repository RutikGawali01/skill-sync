package com.rutik.skill_sync_backend.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO representing a Typing Event.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingEvent {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    private Long userId; // Set by backend based on authenticated session

    private boolean typing;
}
