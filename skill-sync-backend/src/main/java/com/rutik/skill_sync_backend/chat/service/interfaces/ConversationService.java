package com.rutik.skill_sync_backend.chat.service.interfaces;

import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationResponse;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for Conversation operations.
 */
public interface ConversationService {

    /**
     * Creates a new Conversation or returns the existing one if direct.
     *
     * @param currentUserId the ID of the user initiating the conversation
     * @param request the request containing recipient details
     * @return the ConversationResponse
     */
    ConversationResponse createConversation(Long currentUserId, CreateConversationRequest request);

    /**
     * Retrieves details of a specific conversation.
     *
     * @param currentUserId the ID of the requesting user
     * @param conversationId the ID of the conversation
     * @return the ConversationResponse
     */
    ConversationResponse getConversation(Long currentUserId, Long conversationId);

    /**
     * Retrieves a paginated list of conversations for the current user.
     *
     * @param currentUserId the ID of the requesting user
     * @param pageable pagination options
     * @return page of ConversationSummaryResponse
     */
    Page<ConversationSummaryResponse> getConversations(Long currentUserId, Pageable pageable);

    /**
     * Archives a conversation for the user.
     *
     * @param currentUserId the ID of the user
     * @param conversationId the ID of the conversation
     */
    void archiveConversation(Long currentUserId, Long conversationId);

    /**
     * Mutes or unmutes a conversation for the user.
     *
     * @param currentUserId the ID of the user
     * @param conversationId the ID of the conversation
     * @param mute true to mute, false to unmute
     */
    void muteConversation(Long currentUserId, Long conversationId, boolean mute);
}
