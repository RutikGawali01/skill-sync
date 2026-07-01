package com.rutik.skill_sync_backend.chat.dto.response;

import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import lombok.*;
import org.springframework.data.domain.Slice;

import java.time.LocalDateTime;
import java.util.List;

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
    
    private Integer unreadCount;
    private MessageResponse latestMessage;
    private List<ParticipantDto> participants;
    private List<SessionCardResponse> sessions;
    private Slice<MessageResponse> messages;
}
