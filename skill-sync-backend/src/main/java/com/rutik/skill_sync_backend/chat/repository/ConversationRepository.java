package com.rutik.skill_sync_backend.chat.repository;

import com.rutik.skill_sync_backend.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    

    Optional<Conversation> findByIdAndDeletedFalse(Long id);
}
