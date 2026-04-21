package com.rutik.skill_sync_backend.user.service;

import com.rutik.skill_sync_backend.user.dto.AvailabilityDTO;

import java.util.List;

public interface AvailabilityService {

    void saveAvailability(Long userId, List<AvailabilityDTO> availabilityList);

    List<AvailabilityDTO> getAvailability(Long userId);
}