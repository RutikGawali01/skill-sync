package com.rutik.skill_sync_backend.chat.dto.response;

import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO representing a Conversation response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {
    private Long id;
    private ConversationStatus status;
    private ConversationType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
