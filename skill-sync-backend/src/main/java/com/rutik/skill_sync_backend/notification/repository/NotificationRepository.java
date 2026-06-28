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

/**
 * Data-access layer for Notification using derived query methods and minimal JPQL.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Derived Query: Paginated notification history (all non-deleted)
    Page<Notification> findByRecipientIdAndIsDeletedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // Derived Query: Paginated unread notifications
    Page<Notification> findByRecipientIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // Derived Query: Find single notification with recipient verification
    Optional<Notification> findByIdAndRecipientIdAndIsDeletedFalse(Long id, Long recipientId);

    // Allowed JPQL: count unread
    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.recipient.id = :recipientId
              AND n.isRead = false
              AND n.isDeleted = false
            """)
    long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    // Allowed JPQL: bulk update (single)
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isRead = true, n.updatedAt = CURRENT_TIMESTAMP
            WHERE n.id = :id
              AND n.recipient.id = :recipientId
              AND n.isDeleted = false
            """)
    int markAsRead(@Param("id") Long id, @Param("recipientId") Long recipientId);

    // Allowed JPQL: bulk update (all)
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
