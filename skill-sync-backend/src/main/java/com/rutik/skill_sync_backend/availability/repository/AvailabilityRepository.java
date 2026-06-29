package com.rutik.skill_sync_backend.availability.repository;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByUserIdOrderByDayAscStartTimeAsc(Long userId);

    List<Availability> findByUserIn(java.util.Collection<com.rutik.skill_sync_backend.user.entity.User> users);

    // 🔥 OVERLAP DETECTION QUERY
    @Query("""
            SELECT COUNT(a) > 0
            FROM Availability a
            WHERE a.user.id = :userId
            AND a.day = :day
            AND :startTime < a.endTime
            AND :endTime > a.startTime
            """)
    boolean existsOverlappingSlot(
            Long userId,
            DayOfWeek day,
            LocalTime startTime,
            LocalTime endTime
    );


    Optional<Availability> findByIdAndUserId(
            Long availabilityId,
            Long userId
    );



    // 🔥 UPDATE OVERLAP CHECK
    @Query("""
            SELECT COUNT(a) > 0
            FROM Availability a
            WHERE a.user.id = :userId
            AND a.id <> :availabilityId
            AND a.day = :day
            AND :startTime < a.endTime
            AND :endTime > a.startTime
            """)
    boolean existsOverlappingSlotForUpdate(
            Long userId,
            Long availabilityId,
            DayOfWeek day,
            LocalTime startTime,
            LocalTime endTime
    );

    void deleteByIdAndUserId(Long availabilityId, Long userId);
}
