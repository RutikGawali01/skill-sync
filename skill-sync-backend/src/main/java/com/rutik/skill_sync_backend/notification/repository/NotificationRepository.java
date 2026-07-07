package com.rutik.skill_sync_backend.notification.repository;

import com.rutik.skill_sync_backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdAndIsDeletedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    Page<Notification> findByRecipientIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    Optional<Notification> findByIdAndRecipientIdAndIsDeletedFalse(Long id, Long recipientId);

    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.recipient.id = :recipientId
              AND n.isRead = false
              AND n.isDeleted = false
            """)
    long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isRead = true, n.updatedAt = CURRENT_TIMESTAMP
            WHERE n.id = :id
              AND n.recipient.id = :recipientId
              AND n.isDeleted = false
            """)
    int markAsRead(@Param("id") Long id, @Param("recipientId") Long recipientId);

    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isRead = true, n.updatedAt = CURRENT_TIMESTAMP
            WHERE n.recipient.id = :recipientId
              AND n.isRead = false
              AND n.isDeleted = false
            """)
    int markAllReadByRecipientId(@Param("recipientId") Long recipientId);

    // Allowed JPQL: soft delete
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isDeleted = true, n.updatedAt = CURRENT_TIMESTAMP
            WHERE n.id = :id
              AND n.recipient.id = :recipientId
              AND n.isDeleted = false
            """)
    int softDelete(@Param("id") Long id, @Param("recipientId") Long recipientId);
}
