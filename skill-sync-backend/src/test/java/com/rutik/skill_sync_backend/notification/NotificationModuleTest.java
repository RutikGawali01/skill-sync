package com.rutik.skill_sync_backend.notification;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.entity.Notification;
import com.rutik.skill_sync_backend.notification.enums.NotificationEntityType;
import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.notification.factory.NotificationFactory;
import com.rutik.skill_sync_backend.notification.mapper.NotificationMapper;
import com.rutik.skill_sync_backend.notification.repository.NotificationRepository;
import com.rutik.skill_sync_backend.notification.service.NotificationPushService;
import com.rutik.skill_sync_backend.notification.service.impl.NotificationServiceImpl;
import com.rutik.skill_sync_backend.notification.template.NotificationTemplateService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationModuleTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationFactory notificationFactory;

    @Mock
    private NotificationTemplateService templateService;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private NotificationPushService pushService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User recipient;
    private User reviewer;
    private Notification mockNotification;
    private NotificationResponseDto mockResponseDto;

    @BeforeEach
    void setUp() {
        recipient = User.builder()
                .id(1L)
                .name("Recipient Alice")
                .email("alice@test.com")
                .build();

        reviewer = User.builder()
                .id(2L)
                .name("Reviewer Bob")
                .email("bob@test.com")
                .build();

        mockNotification = Notification.builder()
                .id(100L)
                .recipient(recipient)
                .title("You received a new review")
                .message("Reviewer Bob rated your session 5 stars.")
                .notificationType(NotificationType.REVIEW_RECEIVED)
                .notificationPriority(NotificationPriority.NORMAL)
                .entityId(10L)
                .entityType(NotificationEntityType.REVIEW)
                .isRead(false)
                .isDeleted(false)
                .build();

        mockResponseDto = NotificationResponseDto.builder()
                .id(100L)
                .recipientId(1L)
                .title("You received a new review")
                .message("Reviewer Bob rated your session 5 stars.")
                .notificationType(NotificationType.REVIEW_RECEIVED)
                .notificationPriority(NotificationPriority.NORMAL)
                .entityId(10L)
                .entityType(NotificationEntityType.REVIEW)
                .isRead(false)
                .build();
    }

    @Test
    void testNotifyReviewReceived_Success() {
        // Arrange
        when(userRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(recipient));
        when(userRepository.findByIdAndIsActiveTrue(2L)).thenReturn(Optional.of(reviewer));
        
        when(templateService.buildReviewReceivedTitle()).thenReturn("You received a new review");
        when(templateService.buildReviewReceivedMessage("Reviewer Bob", 5))
                .thenReturn("Reviewer Bob rated your session 5 stars.");

        when(notificationFactory.buildNotification(
                eq(recipient),
                eq("You received a new review"),
                eq("Reviewer Bob rated your session 5 stars."),
                eq(NotificationType.REVIEW_RECEIVED),
                eq(NotificationPriority.NORMAL),
                eq(10L),
                eq(NotificationEntityType.REVIEW)))
                .thenReturn(mockNotification);
                
        when(notificationRepository.saveAndFlush(any(Notification.class))).thenReturn(mockNotification);
        when(notificationMapper.toResponseDto(mockNotification)).thenReturn(mockResponseDto);
        when(notificationRepository.countUnreadByRecipientId(1L)).thenReturn(1L);

        // Act
        NotificationResponseDto result = notificationService.notifyReviewReceived(1L, 2L, 10L, 20L, 5);

        // Assert
        assertNotNull(result);
        assertEquals(mockResponseDto.getId(), result.getId());
        assertEquals("You received a new review", result.getTitle());
        
        // Verify interactions
        verify(notificationRepository).saveAndFlush(mockNotification);
        verify(pushService).pushNotification(eq(1L), eq(mockResponseDto));
        verify(pushService).pushUnreadCount(eq(1L), eq(1L));
    }

    @Test
    void testMarkAsRead_Success() {
        // Arrange
        when(notificationRepository.markAsRead(100L, 1L)).thenReturn(1);
        when(notificationRepository.countUnreadByRecipientId(1L)).thenReturn(0L);

        // Act
        assertDoesNotThrow(() -> notificationService.markAsRead(100L, 1L));

        // Assert
        verify(notificationRepository).markAsRead(100L, 1L);
        verify(pushService).pushUnreadCount(1L, 0L);
    }
}
