package com.rutik.skill_sync_backend.chat.controller;

import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.request.TypingEvent;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

/**
 * WebSocket Controller handling real-time chat operations using STOMP.
 * Bypasses HTTP thread context by resolving users from the STOMP Principal name (User ID).
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * Handle client sending a message over STOMP.
     * Destination: /app/chat/send
     */
    @MessageMapping("/chat/send")
    public void handleSendMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("STOMP send message ignored: Anonymous principal");
            return;
        }
        try {
            Long userId = Long.valueOf(principal.getName());
            log.info("STOMP Request: User {} sending message in conversation {}", userId, request.getConversationId());
            chatService.sendMessage(userId, request);
        } catch (Exception e) {
            log.error("Failed to process WebSocket sendMessage: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle typing status events over STOMP.
     * Destination: /app/chat/typing
     */
    @MessageMapping("/chat/typing")
    public void handleTypingEvent(@Payload TypingEvent event, Principal principal) {
        if (principal == null) {
            return;
        }
        try {
            Long userId = Long.valueOf(principal.getName());
            log.info("STOMP Request: User {} typing event in conversation {}: typing={}", userId, event.getConversationId(), event.isTyping());
            
            event.setUserId(userId);

            // Fetch other participant in the conversation to route typing status
            List<ConversationParticipant> participants = conversationParticipantRepository
                    .findByConversationIdAndDeletedFalse(event.getConversationId());

            ConversationParticipant otherParticipant = participants.stream()
                    .filter(p -> !p.getUser().getId().equals(userId))
                    .findFirst()
                    .orElse(null);

            if (otherParticipant != null) {
                log.debug("Routing typing event from {} to recipient {}", userId, otherParticipant.getUser().getId());
                simpMessagingTemplate.convertAndSendToUser(
                        otherParticipant.getUser().getId().toString(),
                        "/queue/chat/typing",
                        event
                );
            }
        } catch (Exception e) {
            log.error("Failed to route typing event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle reading messages / sending read receipts over STOMP.
     * Destination: /app/chat/read
     */
    @MessageMapping("/chat/read")
    public void handleReadReceipt(@Payload ReadReceiptRequest request, Principal principal) {
        if (principal == null) {
            return;
        }
        try {
            Long userId = Long.valueOf(principal.getName());
            log.info("STOMP Request: User {} marking message {} read in conversation {}", userId, request.getMessageId(), request.getConversationId());
            chatService.markAsRead(userId, request);
        } catch (Exception e) {
            log.error("Failed to process WebSocket read receipt: {}", e.getMessage(), e);
        }
    }
}
