package com.rutik.skill_sync_backend.chat.service.interfaces;

import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;


public interface ChatService {


    MessageResponse sendMessage(Long currentUserId, SendMessageRequest request);


    Slice<MessageResponse> getMessages(Long currentUserId, Long conversationId, Pageable pageable);


    void markAsRead(Long currentUserId, ReadReceiptRequest request);


    long getUnreadCount(Long currentUserId);
}
