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


@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {


    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        JOIN FETCH m.conversation c
        WHERE m.id = :id
        AND m.deleted = false
    """)
    Optional<Message> findByIdAndDeletedFalse(@Param("id") Long id);


    @Query(value = """
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        WHERE m.conversation.id = :conversationId
        ORDER BY m.createdAt DESC, m.id DESC
    """)
    Slice<Message> findByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);


    Optional<Message> findFirstByConversationIdAndDeletedFalseOrderByCreatedAtDesc(Long conversationId);


    boolean existsByClientMessageId(String clientMessageId);


    Optional<Message> findByClientMessageId(String clientMessageId);


    @Query("""
        SELECT m FROM Message m
        WHERE m.conversation.id = :conversationId
        AND m.sender.id != :userId
        AND m.status != com.rutik.skill_sync_backend.chat.enums.MessageStatus.READ
        AND m.deleted = false
    """)
    List<Message> findUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

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


    boolean existsBySessionId(Long sessionId);
}
