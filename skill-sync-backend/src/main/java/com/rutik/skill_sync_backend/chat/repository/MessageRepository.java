package com.rutik.skill_sync_backend.chat.repository;

import com.rutik.skill_sync_backend.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
     *
     * @param conversationId the conversation ID
     * @param pageable pagination details
     * @return page of Messages
     */
    @Query(value = """
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        WHERE m.conversation.id = :conversationId
        AND m.deleted = false
    """,
    countQuery = """
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation.id = :conversationId
        AND m.deleted = false
    """)
    Page<Message> findByConversationIdAndDeletedFalse(@Param("conversationId") Long conversationId, Pageable pageable);

    /**
     * Get the latest active message in a conversation.
     *
     * @param conversationId the conversation ID
     * @return an Optional of the latest Message
     */
    Optional<Message> findFirstByConversationIdAndDeletedFalseOrderByCreatedAtDesc(Long conversationId);
}
