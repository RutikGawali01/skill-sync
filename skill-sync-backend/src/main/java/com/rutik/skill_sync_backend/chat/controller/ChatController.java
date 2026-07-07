package com.rutik.skill_sync_backend.chat.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.chat.dto.request.CreateConversationRequest;
import com.rutik.skill_sync_backend.chat.dto.request.ReadReceiptRequest;
import com.rutik.skill_sync_backend.chat.dto.request.SendMessageRequest;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationResponse;
import com.rutik.skill_sync_backend.chat.dto.response.ConversationSummaryResponse;
import com.rutik.skill_sync_backend.chat.dto.response.MessageResponse;
import com.rutik.skill_sync_backend.chat.service.interfaces.ChatService;
import com.rutik.skill_sync_backend.chat.service.interfaces.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ConversationService conversationService;
    private final ChatService chatService;


    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<Page<ConversationSummaryResponse>>> getConversations(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info(" REST Request: Get conversations for user: {}", userId);
        Page<ConversationSummaryResponse> conversations = conversationService.getConversations(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
    }


    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") Long id) {
        log.info(" REST Request: Get conversation {} for user: {}", id, userId);
        ConversationResponse conversation = conversationService.getConversation(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Conversation retrieved successfully", conversation));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<Slice<MessageResponse>>> getMessages(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info(" REST Request: Get messages for conversation {} and user {}", id, userId);
        Slice<MessageResponse> messages = chatService.getMessages(userId, id, pageable);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
    }


    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody SendMessageRequest request) {
        log.info(" REST Request: Send message from user {} in conversation {}", userId, request.getConversationId());
        MessageResponse message = chatService.sendMessage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully", message));
    }


    @PutMapping("/messages/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody ReadReceiptRequest request) {
        log.info(" REST Request: User {} marking message {} in conversation {} as read", userId, request.getMessageId(), request.getConversationId());
        chatService.markAsRead(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read successfully"));
    }


    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal(expression = "id") Long userId) {
        log.info(" REST Request: Get unread chat message count for user: {}", userId);
        long count = chatService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
    }


    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody CreateConversationRequest request) {
        log.info(" REST Request: Create conversation between user {} and user {}", userId, request.getRecipientId());
        ConversationResponse conversation = conversationService.createConversation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conversation created successfully", conversation));
    }
}
