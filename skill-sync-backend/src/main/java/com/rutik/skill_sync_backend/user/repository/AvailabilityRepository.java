package com.rutik.skill_sync_backend.user.repository;

import com.rutik.skill_sync_backend.user.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByUserId(Long userId);

    void deleteByUser_Id(Long userId);

    void deleteByUserId(Long userId);
}