package com.rutik.skill_sync_backend.chat.mapper;

import com.rutik.skill_sync_backend.chat.dto.response.ConversationResponse;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import com.rutik.skill_sync_backend.chat.entity.Conversation;
import com.rutik.skill_sync_backend.chat.entity.Message;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper component using ModelMapper for converting chat entities to DTO responses.
 */
@Component
@RequiredArgsConstructor
public class ChatMapper {

    private final ModelMapper modelMapper;

    /**
     * Map a Conversation entity to a ConversationResponse DTO.
     *
     * @param conversation the Conversation entity
     * @return the ConversationResponse DTO
     */
    public ConversationResponse toResponse(Conversation conversation) {
        if (conversation == null) {
            return null;
        }
        return modelMapper.map(conversation, ConversationResponse.class);
    }

    /**
     * Map a Message entity to a MessageResponse DTO.
     *
     * @param message the Message entity
     * @return the MessageResponse DTO
     */
    public MessageResponse toResponse(Message message) {
        if (message == null) {
            return null;
        }
        MessageResponse response = modelMapper.map(message, MessageResponse.class);
        // Explicitly map nested properties to avoid ModelMapper misalignments
        if (message.getConversation() != null) {
            response.setConversationId(message.getConversation().getId());
        }
        if (message.getSender() != null) {
            response.setSenderId(message.getSender().getId());
            response.setSenderName(message.getSender().getName());
        }
        if (message.getSession() != null) {
            response.setSessionId(message.getSession().getId());
        }
        if (message.getClientMessageId() != null) {
            response.setClientMessageId(message.getClientMessageId());
        }
        if (message.isDeleted()) {
            response.setContent("This message was deleted.");
        }
        return response;
    }
}
