package com.rutik.skill_sync_backend.chat.repository;

import com.rutik.skill_sync_backend.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Conversation entity.
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * Find a conversation by id if it is not soft-deleted.
     *
     * @param id the conversation ID
     * @return an Optional of Conversation
     */
    Optional<Conversation> findByIdAndDeletedFalse(Long id);
}
