package com.rutik.skill_sync_backend.chat.service.impl;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.dto.response.*;
import com.rutik.skill_sync_backend.chat.entity.Conversation;
import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import com.rutik.skill_sync_backend.chat.entity.Message;
import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import com.rutik.skill_sync_backend.chat.mapper.ChatMapper;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.repository.MessageRepository;
import com.rutik.skill_sync_backend.chat.service.interfaces.ConversationService;
import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import com.rutik.skill_sync_backend.review.entity.Review;
import com.rutik.skill_sync_backend.review.repository.ReviewRepository;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service implementation for Conversation management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;
    private final PresenceService presenceService;
    private final ChatMapper chatMapper;

    @Override
    @Transactional
    public ConversationResponse createConversation(Long currentUserId, CreateConversationRequest request) {
        Long recipientId = request.getRecipientId();
        log.info("Creating conversation between user {} and user {}", currentUserId, recipientId);

        if (currentUserId.equals(recipientId)) {
            throw new BadRequestException("Cannot create a conversation with yourself");
        }

        // Validate recipient exists
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        // Prevent duplicate direct conversation creation
        Optional<Conversation> existingOpt = conversationParticipantRepository.findDirectConversation(currentUserId, recipientId);
        if (existingOpt.isPresent()) {
            log.info("Direct conversation already exists between {} and {}. Reusing conversation {}", currentUserId, recipientId, existingOpt.get().getId());
            Conversation existing = existingOpt.get();
            // Ensure status is active
            if (existing.isDeleted()) {
                existing.setDeleted(false);
                existing.setDeletedAt(null);
                conversationRepository.save(existing);
            }
            return getConversation(currentUserId, existing.getId());
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .type(ConversationType.DIRECT)
                .status(ConversationStatus.ACTIVE)
                .deleted(false)
                .build();

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add participants
        ConversationParticipant participant1 = ConversationParticipant.builder()
                .conversation(savedConversation)
                .user(currentUser)
                .archived(false)
                .muted(false)
                .unreadCount(0)
                .deleted(false)
                .build();

        ConversationParticipant participant2 = ConversationParticipant.builder()
                .conversation(savedConversation)
                .user(recipient)
                .archived(false)
                .muted(false)
                .unreadCount(0)
                .deleted(false)
                .build();

        conversationParticipantRepository.save(participant1);
        conversationParticipantRepository.save(participant2);

        log.info("Successfully created new conversation {}", savedConversation.getId());
        return getConversation(currentUserId, savedConversation.getId());
    }

    @Override
    public ConversationResponse getConversation(Long currentUserId, Long conversationId) {
        log.info("Fetching conversation {} for user {}", conversationId, currentUserId);

        Conversation conversation = conversationRepository.findByIdAndDeletedFalse(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (conversation.isDeleted()) {
            throw new BadRequestException("Cannot access a deleted conversation");
        }

        // Validate authenticated user belongs to conversation
        ConversationParticipant currentParticipant = conversationParticipantRepository
                .findByConversationIdAndUserIdAndDeletedFalse(conversationId, currentUserId)
                .orElseThrow(() -> new UnauthorizedException("Access denied: You are not a participant in this conversation"));

        List<ConversationParticipant> participantsList = conversationParticipantRepository
                .findByConversationIdAndDeletedFalse(conversationId);

        // Extract other participant to fetch their user details and sessions
        ConversationParticipant otherParticipant = participantsList.stream()
                .filter(p -> !p.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Conversation does not have another participant"));

        Long otherUserId = otherParticipant.getUser().getId();

        // Fetch participants mapped to ParticipantDto with online presence
        List<ParticipantDto> participantDtos = participantsList.stream()
                .map(p -> ParticipantDto.builder()
                        .id(p.getUser().getId())
                        .name(p.getUser().getName())
                        .profilePicUrl(p.getUser().getProfilePicUrl())
                        .online(presenceService.isUserOnline(p.getUser().getId()))
                        .build())
                .collect(Collectors.toList());

        // Fetch all learning sessions between the two users
        List<Session> sessions = sessionRepository.findSessionsBetweenUsers(currentUserId, otherUserId);
        List<SessionCardResponse> sessionCards = sessions.stream()
                .map(s -> {
                    long duration = Duration.between(s.getStartTime(), s.getEndTime()).toMinutes();
                    boolean showReviewButton = false;
                    boolean reviewSubmitted = false;
                    Long reviewId = null;
                    Integer reviewRating = null;
                    String reviewComment = null;

                    if (s.getStatus() == SessionStatus.COMPLETED) {
                        Optional<Review> reviewOpt = reviewRepository.findBySessionAndReviewerAndReviewee(
                                s,
                                currentParticipant.getUser(),
                                otherParticipant.getUser()
                        );
                        if (reviewOpt.isPresent()) {
                            reviewSubmitted = true;
                            Review rev = reviewOpt.get();
                            reviewId = rev.getId();
                            reviewRating = rev.getOverallRating();
                            reviewComment = rev.getFeedback();
                        } else {
                            showReviewButton = true;
                        }
                    }

                    return SessionCardResponse.builder()
                            .id(s.getId())
                            .skillOffered(s.getSkill().getName())
                            .skillRequested(s.getSkill().getName())
                            .teacherName(s.getProvider().getName())
                            .learnerName(s.getRequester().getName())
                            .teacherProfilePicUrl(s.getProvider().getProfilePicUrl())
                            .learnerProfilePicUrl(s.getRequester().getProfilePicUrl())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .scheduledDate(s.getStartTime().toLocalDate())
                            .scheduledTime(s.getStartTime().toLocalTime())
                            .durationMinutes(duration)
                            .mode(s.getMode())
                            .meetingLink(s.getMeetingLink())
                            .status(s.getStatus())
                            .createdTime(s.getCreatedAt())
                            .completedTime(s.getCompletedAt())
                            .showReviewButton(showReviewButton)
                            .reviewSubmitted(reviewSubmitted)
                            .reviewId(reviewId)
                            .reviewRating(reviewRating)
                            .reviewComment(reviewComment)
                            .build();
                })
                .collect(Collectors.toList());

        // Fetch initial slice of messages (default to page 0, size 50, ordered by newest)
        Pageable messagesPageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        Slice<Message> messagesSlice = messageRepository.findByConversationId(conversationId, messagesPageable);
        Slice<MessageResponse> mappedMessages = messagesSlice.map(chatMapper::toResponse);

        // Fetch latest message (utilizing the latestMessage cache pointer)
        MessageResponse latestMessageResponse = null;
        if (conversation.getLatestMessage() != null) {
            latestMessageResponse = chatMapper.toResponse(conversation.getLatestMessage());
        }

        return ConversationResponse.builder()
                .id(conversation.getId())
                .status(conversation.getStatus())
                .type(conversation.getType())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .unreadCount(currentParticipant.getUnreadCount())
                .latestMessage(latestMessageResponse)
                .participants(participantDtos)
                .sessions(sessionCards)
                .messages(mappedMessages)
                .build();
    }

    @Override
    public Page<ConversationSummaryResponse> getConversations(Long currentUserId, Pageable pageable) {
        log.info("Fetching paginated conversations for user {}", currentUserId);

        // Ensure user exists
        userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<ConversationParticipant> participations = conversationParticipantRepository
                .findByUserIdAndArchivedAndDeletedFalse(currentUserId, false, pageable);

        return participations.map(cp -> {
            Conversation conv = cp.getConversation();
            
            // Get all participants of this conversation to extract the other user
            List<ConversationParticipant> allParts = conversationParticipantRepository
                    .findByConversationIdAndDeletedFalse(conv.getId());

            ConversationParticipant otherCp = allParts.stream()
                    .filter(p -> !p.getUser().getId().equals(currentUserId))
                    .findFirst()
                    .orElse(null);

            String lastMsgContent = null;
            LocalDateTime lastMsgSentAt = null;
            
            // Retrieve latest message from cache pointer
            if (conv.getLatestMessage() != null) {
                lastMsgContent = conv.getLatestMessage().getContent();
                lastMsgSentAt = conv.getLatestMessage().getCreatedAt();
            }

            Long otherId = null;
            String otherName = null;
            String otherProfilePic = null;

            if (otherCp != null) {
                otherId = otherCp.getUser().getId();
                otherName = otherCp.getUser().getName();
                otherProfilePic = otherCp.getUser().getProfilePicUrl();
            }

            return ConversationSummaryResponse.builder()
                    .conversationId(conv.getId())
                    .type(conv.getType())
                    .status(conv.getStatus())
                    .unreadCount(cp.getUnreadCount())
                    .muted(cp.isMuted())
                    .archived(cp.isArchived())
                    .lastMessageContent(lastMsgContent)
                    .lastMessageSentAt(lastMsgSentAt)
                    .otherParticipantId(otherId)
                    .otherParticipantName(otherName)
                    .otherParticipantProfilePicUrl(otherProfilePic)
                    .build();
        });
    }

    @Override
    @Transactional
    public void archiveConversation(Long currentUserId, Long conversationId) {
        log.info("Archiving conversation {} for user {}", conversationId, currentUserId);
        ConversationParticipant participant = conversationParticipantRepository
                .findByConversationIdAndUserIdAndDeletedFalse(conversationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation participant record not found"));

        participant.setArchived(true);
        conversationParticipantRepository.save(participant);
    }

    @Override
    @Transactional
    public void muteConversation(Long currentUserId, Long conversationId, boolean mute) {
        log.info("Muting conversation {} for user {} to {}", conversationId, currentUserId, mute);
        ConversationParticipant participant = conversationParticipantRepository
                .findByConversationIdAndUserIdAndDeletedFalse(conversationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation participant record not found"));

        participant.setMuted(mute);
        conversationParticipantRepository.save(participant);
    }
}
