package com.rutik.skill_sync_backend.chat.repository;

import com.rutik.skill_sync_backend.chat.entity.Message;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find a message by ID if not soft-deleted, fetching relations.
     *
     * @param id the message ID
     * @return an Optional of Message
     */
    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        JOIN FETCH m.conversation c
        WHERE m.id = :id
        AND m.deleted = false
    """)
    Optional<Message> findByIdAndDeletedFalse(@Param("id") Long id);

    /**
     * Find messages in a conversation with pageable sorting, fetching the sender.
     * Ordered by createdAt descending, then id descending.
     * Includes soft-deleted messages so they can render as "This message was deleted".
     *
     * @param conversationId the conversation ID
     * @param pageable pagination details
     * @return slice of Messages
     */
    @Query(value = """
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        WHERE m.conversation.id = :conversationId
        ORDER BY m.createdAt DESC, m.id DESC
    """)
    Slice<Message> findByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);

    /**
     * Get the latest active message in a conversation.
     *
     * @param conversationId the conversation ID
     * @return an Optional of the latest Message
     */
    Optional<Message> findFirstByConversationIdAndDeletedFalseOrderByCreatedAtDesc(Long conversationId);

    /**
     * Check if a message with the given client message ID already exists.
     */
    boolean existsByClientMessageId(String clientMessageId);

    /**
     * Find a message by its client message ID.
     */
    Optional<Message> findByClientMessageId(String clientMessageId);

    /**
     * Find all unread messages in a conversation sent by the other participant.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.conversation.id = :conversationId
        AND m.sender.id != :userId
        AND m.status != com.rutik.skill_sync_backend.chat.enums.MessageStatus.READ
        AND m.deleted = false
    """)
    List<Message> findUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Find all sent (pending delivery) messages in a list of conversations where the sender is NOT the specified user.
     */
    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.conversation c
        JOIN FETCH m.sender s
        WHERE m.conversation.id IN :conversationIds
        AND m.sender.id != :userId
        AND m.status = com.rutik.skill_sync_backend.chat.enums.MessageStatus.SENT
        AND m.deleted = false
    """)
    List<Message> findPendingSentMessagesForReceiver(@Param("conversationIds") List<Long> conversationIds, @Param("userId") Long userId);
}
