package com.rutik.skill_sync_backend.user.service;


import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.user.dto.AvailabilityDTO;
import com.rutik.skill_sync_backend.user.entity.Availability;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.AvailabilityRepository;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    @Override
    public void saveAvailability(Long userId, List<AvailabilityDTO> availabilityList) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 🔥 delete old slots
        availabilityRepository.deleteByUser_Id(userId);

        List<Availability> entities = availabilityList.stream().map(dto ->
                Availability.builder()
                        .user(user)
                        .day(dto.getDay())
                        .startTime(dto.getStartTime())
                        .endTime(dto.getEndTime())
                        .build()
        ).toList();

        availabilityRepository.saveAll(entities);
    }

    @Override
    public List<AvailabilityDTO> getAvailability(Long userId) {

        return availabilityRepository.findByUserId(userId).stream()
                .map(entity -> {
                    AvailabilityDTO dto = new AvailabilityDTO();
                    dto.setDay(entity.getDay());
                    dto.setStartTime(entity.getStartTime());
                    dto.setEndTime(entity.getEndTime());
                    return dto;
                }).toList();
    }
}