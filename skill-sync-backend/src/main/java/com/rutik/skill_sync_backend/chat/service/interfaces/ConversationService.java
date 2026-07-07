package com.rutik.skill_sync_backend.chat.service.interfaces;

import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationResponse;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ConversationService {


    ConversationResponse createConversation(Long currentUserId, CreateConversationRequest request);


    ConversationResponse getConversation(Long currentUserId, Long conversationId);


    Page<ConversationSummaryResponse> getConversations(Long currentUserId, Pageable pageable);


    void archiveConversation(Long currentUserId, Long conversationId);


    void muteConversation(Long currentUserId, Long conversationId, boolean mute);
}
