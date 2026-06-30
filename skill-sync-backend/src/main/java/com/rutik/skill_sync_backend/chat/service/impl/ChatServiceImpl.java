package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.repository.MessageRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Chat messaging operations (Stub).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;

    @Override
    @Transactional
    public MessageResponse sendMessage(Long currentUserId, SendMessageRequest request) {
        log.info("User {} sending message in conversation {}", currentUserId, request.getConversationId());
        throw new UnsupportedOperationException("Send message logic is not implemented yet in this phase.");
    }

    @Override
    public Page<MessageResponse> getMessages(Long currentUserId, Long conversationId, Pageable pageable) {
        log.info("Fetching messages in conversation {} for user {}", conversationId, currentUserId);
        throw new UnsupportedOperationException("Fetch messages logic is not implemented yet in this phase.");
    }

    @Override
    @Transactional
    public void markAsRead(Long currentUserId, ReadReceiptRequest request) {
        log.info("User {} marking message {} in conversation {} as read", currentUserId, request.getMessageId(), request.getConversationId());
        throw new UnsupportedOperationException("Mark as read logic is not implemented yet in this phase.");
    }

    @Override
    public long getUnreadCount(Long currentUserId) {
        log.info("Getting unread count for user {}", currentUserId);
        throw new UnsupportedOperationException("Unread count logic is not implemented yet in this phase.");
    }
}
