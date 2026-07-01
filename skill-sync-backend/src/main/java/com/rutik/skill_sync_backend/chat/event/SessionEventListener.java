package com.rutik.skill_sync_backend.chat.event;

import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import com.rutik.skill_sync_backend.chat.service.interfaces.ConversationService;
import com.rutik.skill_sync_backend.session.event.SessionAcceptedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener that processes session-related lifecycle events
 * to trigger automatic chat setup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionEventListener {

    private final ConversationService conversationService;

    /**
     * Listens for SessionAcceptedEvent to create/reuse a conversation between the provider and requester.
     */
    @EventListener
    public void handleSessionAccepted(SessionAcceptedEvent event) {
        log.info("🔔 Chat Event: Session accepted event received for session {}. Requester: {}, Provider: {}",
                event.getSessionId(), event.getRequesterId(), event.getProviderId());
        try {
            // Ensure conversation exists between the requester and provider
            CreateConversationRequest request = CreateConversationRequest.builder()
                    .recipientId(event.getProviderId())
                    .type(ConversationType.DIRECT)
                    .build();
            conversationService.createConversation(event.getRequesterId(), request);
            log.info("✅ Chat Event: Conversation ensured between user {} and user {}", event.getRequesterId(), event.getProviderId());
        } catch (Exception e) {
            log.error("❌ Chat Event: Failed to ensure conversation for accepted session {}", event.getSessionId(), e);
        }
    }
}
