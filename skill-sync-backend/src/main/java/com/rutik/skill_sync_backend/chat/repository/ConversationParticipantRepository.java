package com.rutik.skill_sync_backend.chat.repository;

import com.rutik.skill_sync_backend.chat.entity.Conversation;
import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ConversationParticipant entity.
 */
@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    /**
     * Find a participant by conversation ID and user ID if not soft-deleted.
     *
     * @param conversationId the conversation ID
     * @param userId the user ID
     * @return an Optional of ConversationParticipant
     */
    Optional<ConversationParticipant> findByConversationIdAndUserIdAndDeletedFalse(Long conversationId, Long userId);

    /**
     * Find all active (not soft-deleted) participants in a conversation with user fetched.
     *
     * @param conversationId the conversation ID
     * @return list of ConversationParticipants
     */
    @Query("""
        SELECT cp FROM ConversationParticipant cp
        JOIN FETCH cp.user u
        WHERE cp.conversation.id = :conversationId
        AND cp.deleted = false
    """)
    List<ConversationParticipant> findByConversationIdAndDeletedFalse(@Param("conversationId") Long conversationId);

    /**
     * Find all conversation participations for a user, using fetch joins to avoid N+1 queries.
     *
     * @param userId the user ID
     * @param archived filter by archived status
     * @param pageable pagination details
     * @return page of ConversationParticipants
     */
    @Query(value = """
        SELECT cp FROM ConversationParticipant cp
        JOIN FETCH cp.conversation c
        JOIN FETCH cp.user u
        WHERE cp.user.id = :userId
        AND cp.archived = :archived
        AND cp.deleted = false
        AND c.deleted = false
    """,
    countQuery = """
        SELECT COUNT(cp) FROM ConversationParticipant cp
        WHERE cp.user.id = :userId
        AND cp.archived = :archived
        AND cp.deleted = false
        AND cp.conversation.deleted = false
    """)
    Page<ConversationParticipant> findByUserIdAndArchivedAndDeletedFalse(
        @Param("userId") Long userId, 
        @Param("archived") boolean archived, 
        Pageable pageable
    );

    /**
     * Find a direct conversation between two users.
     *
     * @param userId1 the first user ID
     * @param userId2 the second user ID
     * @return an Optional of Conversation
     */
    @Query("""
        SELECT cp1.conversation FROM ConversationParticipant cp1
        JOIN ConversationParticipant cp2 ON cp1.conversation.id = cp2.conversation.id
        WHERE cp1.user.id = :userId1
        AND cp2.user.id = :userId2
        AND cp1.conversation.type = com.rutik.skill_sync_backend.chat.enums.ConversationType.DIRECT
        AND cp1.conversation.deleted = false
        AND cp1.deleted = false
        AND cp2.deleted = false
    """)
    Optional<Conversation> findDirectConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Check if a participant exists in a conversation.
     *
     * @param conversationId the conversation ID
     * @param userId the user ID
     * @return true if participant exists and is not soft-deleted
     */
    boolean existsByConversationIdAndUserIdAndDeletedFalse(Long conversationId, Long userId);
}
