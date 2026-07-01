package com.rutik.skill_sync_backend.chat;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
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
import com.rutik.skill_sync_backend.chat.mapper.ChatMapper;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.repository.MessageRepository;
import com.rutik.skill_sync_backend.chat.service.impl.ChatServiceImpl;
import com.rutik.skill_sync_backend.chat.service.interfaces.PresenceService;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ConversationParticipantRepository conversationParticipantRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PresenceService presenceService;

    @Mock
    private ChatMapper chatMapper;

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @InjectMocks
    private ChatServiceImpl chatService;

    private User sender;
    private User recipient;
    private Conversation conversation;
    private ConversationParticipant senderParticipant;
    private ConversationParticipant recipientParticipant;
    private Session session;
    private Skill skill;

    @BeforeEach
    void setUp() {
        sender = User.builder().id(1L).name("Sender John").email("john@test.com").build();
        recipient = User.builder().id(2L).name("Recipient Jane").email("jane@test.com").build();
        
        conversation = Conversation.builder()
                .id(10L)
                .status(ConversationStatus.ACTIVE)
                .deleted(false)
                .build();

        senderParticipant = ConversationParticipant.builder()
                .id(101L)
                .conversation(conversation)
                .user(sender)
                .unreadCount(0)
                .build();

        recipientParticipant = ConversationParticipant.builder()
                .id(102L)
                .conversation(conversation)
                .user(recipient)
                .unreadCount(0)
                .build();

        skill = Skill.builder().id(5L).name("Java Programming").build();

        session = Session.builder()
                .id(100L)
                .requester(sender)
                .provider(recipient)
                .skill(skill)
                .status(SessionStatus.ACCEPTED)
                .build();
    }

    @Test
    void sendMessage_Success_RecipientOnline() {
        // Arrange
        SendMessageRequest request = SendMessageRequest.builder()
                .conversationId(10L)
                .sessionId(100L)
                .content("Hello Jane!")
                .type(MessageType.TEXT)
                .clientMessageId("msg-1")
                .build();

        when(conversationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(conversation));
        
        List<ConversationParticipant> participants = List.of(senderParticipant, recipientParticipant);
        when(conversationParticipantRepository.findByConversationIdAndDeletedFalse(10L)).thenReturn(participants);
        when(conversationParticipantRepository.findById(101L)).thenReturn(Optional.of(senderParticipant));
        when(conversationParticipantRepository.findById(102L)).thenReturn(Optional.of(recipientParticipant));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(presenceService.isUserOnline(2L)).thenReturn(true);

        Message mockMessage = Message.builder()
                .id(500L)
                .conversation(conversation)
                .sender(sender)
                .session(session)
                .content("Hello Jane!")
                .status(MessageStatus.DELIVERED)
                .clientMessageId("msg-1")
                .build();

        when(messageRepository.save(any(Message.class))).thenReturn(mockMessage);
        
        MessageResponse responseDto = MessageResponse.builder()
                .id(500L)
                .conversationId(10L)
                .sessionId(100L)
                .senderId(1L)
                .content("Hello Jane!")
                .status(MessageStatus.DELIVERED)
                .clientMessageId("msg-1")
                .build();
        
        when(chatMapper.toResponse(any(Message.class))).thenReturn(responseDto);

        // Act
        MessageResponse result = chatService.sendMessage(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(MessageStatus.DELIVERED, result.getStatus());
        assertEquals("Hello Jane!", result.getContent());
        assertEquals(1, recipientParticipant.getUnreadCount()); // recipient unread count should be incremented

        // Verify WebSocket broadcasts
        verify(simpMessagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/chat/messages"), any(MessageResponse.class));
        verify(simpMessagingTemplate).convertAndSendToUser(eq("2"), eq("/queue/chat/messages"), any(MessageResponse.class));
        verify(simpMessagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/chat/message-delivered"), any(MessageResponse.class));
    }

    @Test
    void sendMessage_Success_RecipientOffline() {
        // Arrange
        SendMessageRequest request = SendMessageRequest.builder()
                .conversationId(10L)
                .sessionId(100L)
                .content("Hello Jane!")
                .type(MessageType.TEXT)
                .clientMessageId("msg-2")
                .build();

        when(conversationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(conversation));
        
        List<ConversationParticipant> participants = List.of(senderParticipant, recipientParticipant);
        when(conversationParticipantRepository.findByConversationIdAndDeletedFalse(10L)).thenReturn(participants);
        when(conversationParticipantRepository.findById(101L)).thenReturn(Optional.of(senderParticipant));
        when(conversationParticipantRepository.findById(102L)).thenReturn(Optional.of(recipientParticipant));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(presenceService.isUserOnline(2L)).thenReturn(false);

        Message mockMessage = Message.builder()
                .id(501L)
                .conversation(conversation)
                .sender(sender)
                .session(session)
                .content("Hello Jane!")
                .status(MessageStatus.SENT)
                .clientMessageId("msg-2")
                .build();

        when(messageRepository.save(any(Message.class))).thenReturn(mockMessage);
        
        MessageResponse responseDto = MessageResponse.builder()
                .id(501L)
                .conversationId(10L)
                .sessionId(100L)
                .senderId(1L)
                .content("Hello Jane!")
                .status(MessageStatus.SENT)
                .clientMessageId("msg-2")
                .build();
        
        when(chatMapper.toResponse(any(Message.class))).thenReturn(responseDto);

        // Act
        MessageResponse result = chatService.sendMessage(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(MessageStatus.SENT, result.getStatus());
        verify(simpMessagingTemplate, never()).convertAndSendToUser(eq("1"), eq("/queue/chat/message-delivered"), any(MessageResponse.class));
    }

    @Test
    void sendMessage_ReadOnly_CompletedSession_ThrowsException() {
        // Arrange
        session.setStatus(SessionStatus.COMPLETED);

        SendMessageRequest request = SendMessageRequest.builder()
                .conversationId(10L)
                .sessionId(100L)
                .content("Cannot send this")
                .build();

        when(conversationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(conversation));
        
        List<ConversationParticipant> participants = List.of(senderParticipant, recipientParticipant);
        when(conversationParticipantRepository.findByConversationIdAndDeletedFalse(10L)).thenReturn(participants);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            chatService.sendMessage(1L, request);
        });

        assertTrue(exception.getMessage().contains("read-only"));
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void sendMessage_BlankContent_ThrowsException() {
        // Arrange
        SendMessageRequest request = SendMessageRequest.builder()
                .conversationId(10L)
                .sessionId(100L)
                .content("   ")
                .build();

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            chatService.sendMessage(1L, request);
        });

        assertTrue(exception.getMessage().contains("content cannot be blank"));
    }

    @Test
    void markAsRead_Success() {
        // Arrange
        ReadReceiptRequest request = ReadReceiptRequest.builder()
                .conversationId(10L)
                .messageId(500L)
                .build();

        when(conversationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(conversation));
        when(conversationParticipantRepository.findByConversationIdAndUserIdAndDeletedFalse(10L, 2L))
                .thenReturn(Optional.of(recipientParticipant));
        
        List<ConversationParticipant> participants = List.of(senderParticipant, recipientParticipant);
        when(conversationParticipantRepository.findByConversationIdAndDeletedFalse(10L)).thenReturn(participants);
        when(conversationParticipantRepository.findById(102L)).thenReturn(Optional.of(recipientParticipant));

        List<Message> unreadMessages = new ArrayList<>();
        unreadMessages.add(Message.builder().id(499L).status(MessageStatus.DELIVERED).build());
        unreadMessages.add(Message.builder().id(500L).status(MessageStatus.DELIVERED).build());

        when(messageRepository.findUnreadMessages(10L, 2L)).thenReturn(unreadMessages);

        // Act
        chatService.markAsRead(2L, request);

        // Assert
        assertEquals(0, recipientParticipant.getUnreadCount());
        assertEquals(500L, recipientParticipant.getLastReadMessageId());
        
        for (Message msg : unreadMessages) {
            assertEquals(MessageStatus.READ, msg.getStatus());
        }

        // Verify read receipt is broadcasted to the sender (user 1)
        verify(simpMessagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/chat/read-receipts"), any(Object.class));
    }
}
