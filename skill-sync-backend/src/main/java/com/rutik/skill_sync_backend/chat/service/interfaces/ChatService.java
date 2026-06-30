package com.rutik.skill_sync_backend.chat.service.interfaces;

import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for Chat messaging operations.
 */
public interface ChatService {

    /**
     * Sends a new message in a conversation.
     *
     * @param currentUserId the ID of the user sending the message
     * @param request the send message request payload
     * @return the MessageResponse
     */
    MessageResponse sendMessage(Long currentUserId, SendMessageRequest request);

    /**
     * Retrieves messages for a conversation in a paginated manner.
     *
     * @param currentUserId the ID of the requesting user
     * @param conversationId the ID of the conversation
     * @param pageable pagination options
     * @return page of MessageResponse
     */
    Page<MessageResponse> getMessages(Long currentUserId, Long conversationId, Pageable pageable);

    /**
     * Marks a specific message and all prior messages in the conversation as read.
     *
     * @param currentUserId the ID of the user marking messages as read
     * @param request the read receipt request payload
     */
    void markAsRead(Long currentUserId, ReadReceiptRequest request);

    /**
     * Get the total unread messages count for the user across all conversations.
     *
     * @param currentUserId the ID of the user
     * @return the total unread messages count
     */
    long getUnreadCount(Long currentUserId);
}
