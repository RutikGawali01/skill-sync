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


@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {


    Optional<ConversationParticipant> findByConversationIdAndUserIdAndDeletedFalse(Long conversationId, Long userId);


    @Query("""
        SELECT cp FROM ConversationParticipant cp
        JOIN FETCH cp.user u
        WHERE cp.conversation.id = :conversationId
        AND cp.deleted = false
    """)
    List<ConversationParticipant> findByConversationIdAndDeletedFalse(@Param("conversationId") Long conversationId);


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


    boolean existsByConversationIdAndUserIdAndDeletedFalse(Long conversationId, Long userId);


    @Query("SELECT cp.conversation.id FROM ConversationParticipant cp WHERE cp.user.id = :userId AND cp.deleted = false")
    List<Long> findConversationIdsByUserId(@Param("userId") Long userId);
}
