package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import com.rutik.skill_sync_backend.chat.entity.Conversation;
import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import com.rutik.skill_sync_backend.chat.entity.Message;
import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.MessageStatus;
import com.rutik.skill_sync_backend.chat.enums.MessageType;
import com.rutik.skill_sync_backend.chat.event.UserOnlineEvent;
import com.rutik.skill_sync_backend.chat.mapper.ChatMapper;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.repository.MessageRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.ChatService;
import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service implementation for Chat messaging operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PresenceService presenceService;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(Long currentUserId, SendMessageRequest request) {
        log.info("User {} sending message in conversation {}", currentUserId, request.getConversationId());

        // 1. Content validation
        String trimmedContent = request.getContent() == null ? "" : request.getContent().trim();
        if (trimmedContent.isEmpty()) {
            throw new BadRequestException("Message content cannot be blank");
        }
        if (trimmedContent.length() > 4000) {
            throw new BadRequestException("Message content cannot exceed 4000 characters");
        }

        // 2. Duplicate detection
        if (request.getClientMessageId() != null && !request.getClientMessageId().isBlank()) {
            Optional<Message> duplicateOpt = messageRepository.findByClientMessageId(request.getClientMessageId());
            if (duplicateOpt.isPresent()) {
                log.warn("Duplicate message detected with clientMessageId: {}. Returning existing message.", request.getClientMessageId());
                return chatMapper.toResponse(duplicateOpt.get());
            }
        }

        // 3. Conversation validation
        Conversation conversation = conversationRepository.findByIdAndDeletedFalse(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or deleted"));

        if (conversation.isDeleted() || conversation.getStatus() != ConversationStatus.ACTIVE) {
            throw new BadRequestException("Cannot send message in an inactive or deleted conversation");
        }

        // 4. Authorization validation (Does user belong to conversation?)
        List<ConversationParticipant> participants = conversationParticipantRepository
                .findByConversationIdAndDeletedFalse(request.getConversationId());

        ConversationParticipant senderParticipant = participants.stream()
                .filter(p -> p.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElseThrow(() -> new UnauthorizedException("Access denied: You are not a participant in this conversation"));

        ConversationParticipant receiverParticipant = participants.stream()
                .filter(p -> !p.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Conversation does not have a recipient participant"));

        Long recipientId = receiverParticipant.getUser().getId();

        // 5. Session validation
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        // Validate session belongs to this conversation (i.e. is between these two users)
        boolean sessionBelongs = (session.getRequester().getId().equals(currentUserId) && session.getProvider().getId().equals(recipientId))
                || (session.getProvider().getId().equals(currentUserId) && session.getRequester().getId().equals(recipientId));

        if (!sessionBelongs) {
            throw new BadRequestException("Session does not belong to this conversation");
        }

        // Validate session state & read-only rules
        if (session.getStatus() == SessionStatus.PENDING || session.getStatus() == SessionStatus.REJECTED) {
            throw new BadRequestException("Chat is not available when session is PENDING or REJECTED");
        } else if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new BadRequestException("Conversation is read-only. Session is completed.");
        } else if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new BadRequestException("Conversation is read-only. Session is cancelled.");
        }

        // 6. Resolve online presence & delivery status
        boolean recipientOnline = presenceService.isUserOnline(recipientId);
        MessageStatus status = recipientOnline ? MessageStatus.DELIVERED : MessageStatus.SENT;

        // 7. Save message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(senderParticipant.getUser())
                .session(session)
                .content(trimmedContent)
                .type(request.getType() == null ? MessageType.TEXT : request.getType())
                .status(status)
                .clientMessageId(request.getClientMessageId())
                .deleted(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        // 8. Update conversation audit fields & latestMessage optimization
        conversation.setLatestMessage(savedMessage);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // 9. Update participant states with optimistic locking retry
        // Sender has read their own message
        updateSenderLastReadWithRetry(senderParticipant.getId(), savedMessage.getId());

        // Increment receiver's unread count
        incrementUnreadCountWithRetry(receiverParticipant.getId());

        // 10. Broadcast WebSocket events
        MessageResponse response = chatMapper.toResponse(savedMessage);
        response.setSessionId(session.getId());

        log.info("Broadcasting NEW_MESSAGE for message {} to users {} and {}", savedMessage.getId(), currentUserId, recipientId);
        simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/queue/chat/messages", response);
        simpMessagingTemplate.convertAndSendToUser(recipientId.toString(), "/queue/chat/messages", response);

        if (status == MessageStatus.DELIVERED) {
            log.info("Broadcasting MESSAGE_DELIVERED for message {} to sender {}", savedMessage.getId(), currentUserId);
            simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/queue/chat/message-delivered", response);
        }

        return response;
    }

    @Override
    public Slice<MessageResponse> getMessages(Long currentUserId, Long conversationId, Pageable pageable) {
        log.info("Fetching messages in conversation {} for user {}", conversationId, currentUserId);

        // Validate conversation exists and active user participation
        conversationRepository.findByIdAndDeletedFalse(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or deleted"));

        if (!conversationParticipantRepository.existsByConversationIdAndUserIdAndDeletedFalse(conversationId, currentUserId)) {
            throw new UnauthorizedException("Access denied: You are not a participant in this conversation");
        }

        Slice<Message> messages = messageRepository.findByConversationId(conversationId, pageable);
        return messages.map(chatMapper::toResponse);
    }

    @Override
    @Transactional
    public void markAsRead(Long currentUserId, ReadReceiptRequest request) {
        Long conversationId = request.getConversationId();
        Long messageId = request.getMessageId();
        log.info("User {} marking message {} in conversation {} as read", currentUserId, messageId, conversationId);

        // Validate conversation and user participation
        conversationRepository.findByIdAndDeletedFalse(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or deleted"));

        ConversationParticipant currentParticipant = conversationParticipantRepository
                .findByConversationIdAndUserIdAndDeletedFalse(conversationId, currentUserId)
                .orElseThrow(() -> new UnauthorizedException("Access denied: You are not a participant in this conversation"));

        List<ConversationParticipant> participants = conversationParticipantRepository
                .findByConversationIdAndDeletedFalse(conversationId);

        ConversationParticipant otherParticipant = participants.stream()
                .filter(p -> !p.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        if (otherParticipant == null) {
            return;
        }

        // Fetch all unread messages sent by the OTHER participant
        List<Message> unreadMessages = messageRepository.findUnreadMessages(conversationId, currentUserId);
        
        if (!unreadMessages.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (Message msg : unreadMessages) {
                msg.setStatus(MessageStatus.READ);
                msg.setUpdatedAt(now);
            }
            messageRepository.saveAll(unreadMessages);
        }

        // Reset current user's unread count with optimistic locking retry
        resetUnreadCountWithRetry(currentParticipant.getId(), messageId);

        // Broadcast READ_RECEIPT WebSocket event to the other participant
        Map<String, Object> receiptPayload = new HashMap<>();
        receiptPayload.put("conversationId", conversationId);
        receiptPayload.put("messageId", messageId);
        receiptPayload.put("readerId", currentUserId);

        log.info("Broadcasting READ_RECEIPT to other user {}", otherParticipant.getUser().getId());
        simpMessagingTemplate.convertAndSendToUser(
                otherParticipant.getUser().getId().toString(),
                "/queue/chat/read-receipts",
                receiptPayload
        );
    }

    @Override
    public long getUnreadCount(Long currentUserId) {
        log.info("Getting unread count for user {}", currentUserId);
        // Ensure user exists
        userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<ConversationParticipant> participations = conversationParticipantRepository
                .findByUserIdAndArchivedAndDeletedFalse(currentUserId, false, Pageable.unpaged());

        return participations.stream()
                .mapToLong(ConversationParticipant::getUnreadCount)
                .sum();
    }

    /**
     * Listens for UserOnlineEvent. When a user connects (goes online), retrieve all their conversations,
     * find any SENT messages sent by others, update them to DELIVERED, and broadcast updates to their senders.
     */
    @EventListener
    @Transactional
    public void handleUserOnline(UserOnlineEvent event) {
        Long userId = event.getUserId();
        log.info("⚡ Chat Event: User {} is online. Checking for pending sent messages to deliver...", userId);
        try {
            List<Long> conversationIds = conversationParticipantRepository.findConversationIdsByUserId(userId);
            if (conversationIds.isEmpty()) {
                return;
            }

            List<Message> pendingMessages = messageRepository.findPendingSentMessagesForReceiver(conversationIds, userId);
            if (pendingMessages.isEmpty()) {
                log.info("No pending sent messages found for user {}", userId);
                return;
            }

            log.info("Found {} pending sent messages for user {}. Updating to DELIVERED...", pendingMessages.size(), userId);
            LocalDateTime now = LocalDateTime.now();
            for (Message msg : pendingMessages) {
                msg.setStatus(MessageStatus.DELIVERED);
                msg.setUpdatedAt(now);
            }
            messageRepository.saveAll(pendingMessages);

            // Broadcast delivery receipts back to senders
            for (Message msg : pendingMessages) {
                MessageResponse response = chatMapper.toResponse(msg);
                log.info("Broadcasting reconnect delivery update for message {} to sender {}", msg.getId(), msg.getSender().getId());
                simpMessagingTemplate.convertAndSendToUser(
                        msg.getSender().getId().toString(),
                        "/queue/chat/message-delivered",
                        response
                );
            }
        } catch (Exception e) {
            log.error("Failed to deliver pending messages for reconnected user {}: {}", userId, e.getMessage(), e);
        }
    }

    // ── Helper Methods with Retry for Optimistic Locking ──

    private void incrementUnreadCountWithRetry(Long participantId) {
        int maxRetries = 3;
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                ConversationParticipant participant = conversationParticipantRepository.findById(participantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
                participant.setUnreadCount(participant.getUnreadCount() + 1);
                conversationParticipantRepository.saveAndFlush(participant);
                return;
            } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                attempt++;
                if (attempt >= maxRetries) {
                    log.error("Failed to increment unread count for participant {} after {} retries due to concurrent updates.", participantId, maxRetries);
                    throw e;
                }
                log.warn("Optimistic lock conflict on incrementing unread count for participant {}. Retrying attempt {}/3...", participantId, attempt);
                backoff(attempt);
            }
        }
    }

    private void resetUnreadCountWithRetry(Long participantId, Long messageId) {
        int maxRetries = 3;
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                ConversationParticipant participant = conversationParticipantRepository.findById(participantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
                participant.setUnreadCount(0);
                participant.setLastReadMessageId(messageId);
                conversationParticipantRepository.saveAndFlush(participant);
                return;
            } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                attempt++;
                if (attempt >= maxRetries) {
                    log.error("Failed to reset unread count for participant {} after {} retries due to concurrent updates.", participantId, maxRetries);
                    throw e;
                }
                log.warn("Optimistic lock conflict on resetting unread count for participant {}. Retrying attempt {}/3...", participantId, attempt);
                backoff(attempt);
            }
        }
    }

    private void updateSenderLastReadWithRetry(Long participantId, Long messageId) {
        int maxRetries = 3;
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                ConversationParticipant participant = conversationParticipantRepository.findById(participantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
                participant.setLastReadMessageId(messageId);
                conversationParticipantRepository.saveAndFlush(participant);
                return;
            } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                attempt++;
                if (attempt >= maxRetries) {
                    log.error("Failed to update sender last read message for participant {} after {} retries due to concurrent updates.", participantId, maxRetries);
                    throw e;
                }
                log.warn("Optimistic lock conflict on updating sender last read message for participant {}. Retrying attempt {}/3...", participantId, attempt);
                backoff(attempt);
            }
        }
    }

    private void backoff(int attempt) {
        try {
            Thread.sleep(50L * attempt);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
