package com.rutik.skill_sync_backend.chat.dto.response;

import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSummaryResponse {
    private Long conversationId;
    private ConversationType type;
    private ConversationStatus status;
    private Integer unreadCount;
    private boolean muted;
    private boolean archived;
    private String lastMessageContent;
    private LocalDateTime lastMessageSentAt;
    private Long otherParticipantId;
    private String otherParticipantName;
    private String otherParticipantProfilePicUrl;
    private String skillExchange;
    private String sessionStatus;
}
