package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationResponse;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationSummaryResponse;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.ConversationService;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Conversation management (Stub).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ConversationResponse createConversation(Long currentUserId, CreateConversationRequest request) {
        log.info("Creating conversation between user {} and user {}", currentUserId, request.getRecipientId());
        throw new UnsupportedOperationException("Conversation creation logic is not implemented yet in this phase.");
    }

    @Override
    public ConversationResponse getConversation(Long currentUserId, Long conversationId) {
        log.info("Fetching conversation {} for user {}", conversationId, currentUserId);
        throw new UnsupportedOperationException("Fetch conversation logic is not implemented yet in this phase.");
    }

    @Override
    public Page<ConversationSummaryResponse> getConversations(Long currentUserId, Pageable pageable) {
        log.info("Fetching paginated conversations for user {}", currentUserId);
        throw new UnsupportedOperationException("Fetch conversations logic is not implemented yet in this phase.");
    }

    @Override
    @Transactional
    public void archiveConversation(Long currentUserId, Long conversationId) {
        log.info("Archiving conversation {} for user {}", conversationId, currentUserId);
        throw new UnsupportedOperationException("Archive conversation logic is not implemented yet in this phase.");
    }

    @Override
    @Transactional
    public void muteConversation(Long currentUserId, Long conversationId, boolean mute) {
        log.info("Muting conversation {} for user {} to {}", conversationId, currentUserId, mute);
        throw new UnsupportedOperationException("Mute conversation logic is not implemented yet in this phase.");
    }
}
