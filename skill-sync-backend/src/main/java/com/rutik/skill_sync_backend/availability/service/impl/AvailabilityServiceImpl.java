package com.rutik.skill_sync_backend.availability.service.impl;

import com.rutik.skill_sync_backend.availability.dto.request.AvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.request.UpdateAvailabilityRequestDTO;
import com.rutik.skill_sync_backend.availability.dto.response.AvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.CommonAvailabilityResponseDTO;
import com.rutik.skill_sync_backend.availability.dto.response.SessionSuggestionResponseDTO;
import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.availability.mapper.AvailabilityMapper;
import com.rutik.skill_sync_backend.availability.repository.AvailabilityRepository;
import com.rutik.skill_sync_backend.availability.service.Interfaces.AvailabilityService;
import com.rutik.skill_sync_backend.availability.validator.AvailabilityValidator;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    @Override
    public AvailabilityResponseDTO addAvailability(
            Long userId,
            AvailabilityRequestDTO requestDTO
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        AvailabilityValidator.validateTimeRange(
                requestDTO.getStartTime(),
                requestDTO.getEndTime()
        );

        boolean overlapExists =
                availabilityRepository.existsOverlappingSlot(
                        userId,
                        requestDTO.getDay(),
                        requestDTO.getStartTime(),
                        requestDTO.getEndTime()
                );

        if (overlapExists) {
            throw new BadRequestException(
                    "Availability slot overlaps with existing slot"
            );
        }

        Availability availability = Availability.builder()
                .user(user)
                .day(requestDTO.getDay())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .build();

        return AvailabilityMapper.toDTO(
                availabilityRepository.save(availability)
        );
    }

    @Override
    public AvailabilityResponseDTO updateAvailability(
            Long userId,
            Long availabilityId,
            UpdateAvailabilityRequestDTO requestDTO
    ) {

        Availability availability =
                availabilityRepository.findByIdAndUserId(
                                availabilityId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Availability slot not found"
                                )
                        );

        AvailabilityValidator.validateTimeRange(
                requestDTO.getStartTime(),
                requestDTO.getEndTime()
        );

        boolean overlapExists =
                availabilityRepository.existsOverlappingSlotForUpdate(
                        userId,
                        availabilityId,
                        requestDTO.getDay(),
                        requestDTO.getStartTime(),
                        requestDTO.getEndTime()
                );

        if (overlapExists) {
            throw new BadRequestException(
                    "Updated slot overlaps with existing slot"
            );
        }

        availability.setDay(requestDTO.getDay());
        availability.setStartTime(requestDTO.getStartTime());
        availability.setEndTime(requestDTO.getEndTime());

        return AvailabilityMapper.toDTO(
                availabilityRepository.save(availability)
        );
    }

    @Override
    public List<AvailabilityResponseDTO> getUserAvailability(
            Long userId
    ) {

        return availabilityRepository
                .findByUserIdOrderByDayAscStartTimeAsc(userId)
                .stream()
                .map(AvailabilityMapper::toDTO)
                .toList();
    }

    @Override
    public List<CommonAvailabilityResponseDTO> getCommonAvailability(
            Long firstUserId,
            Long secondUserId
    ) {

        List<Availability> firstUserAvailability =
                availabilityRepository.findByUserIdOrderByDayAscStartTimeAsc(
                        firstUserId
                );

        List<Availability> secondUserAvailability =
                availabilityRepository.findByUserIdOrderByDayAscStartTimeAsc(
                        secondUserId
                );

        List<CommonAvailabilityResponseDTO> commonSlots =
                new ArrayList<>();

        for (Availability first : firstUserAvailability) {

            for (Availability second : secondUserAvailability) {

                // 🔥 SAME DAY REQUIRED
                if (!first.getDay().equals(second.getDay())) {
                    continue;
                }

                LocalTime overlapStart =
                        first.getStartTime().isAfter(second.getStartTime())
                                ? first.getStartTime()
                                : second.getStartTime();

                LocalTime overlapEnd =
                        first.getEndTime().isBefore(second.getEndTime())
                                ? first.getEndTime()
                                : second.getEndTime();

                // 🔥 VALID OVERLAP
                if (overlapStart.isBefore(overlapEnd)) {

                    commonSlots.add(
                            CommonAvailabilityResponseDTO.builder()
                                    .day(first.getDay())
                                    .commonStartTime(overlapStart)
                                    .commonEndTime(overlapEnd)
                                    .build()
                    );
                }
            }
        }

        return commonSlots;
    }

    @Override
    public void deleteAvailability(
            Long userId,
            Long availabilityId
    ) {

        Availability availability =
                availabilityRepository.findByIdAndUserId(
                                availabilityId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Availability slot not found"
                                )
                        );

        availabilityRepository.delete(availability);
    }

    @Override
    public List<SessionSuggestionResponseDTO> getSessionSuggestions(
            Long firstUserId,
            Long secondUserId,
            Integer minimumDurationMinutes
    ) {

        List<Availability> firstUserAvailability =
                availabilityRepository.findByUserIdOrderByDayAscStartTimeAsc(
                        firstUserId
                );

        List<Availability> secondUserAvailability =
                availabilityRepository.findByUserIdOrderByDayAscStartTimeAsc(
                        secondUserId
                );

        List<SessionSuggestionResponseDTO> suggestions =
                new ArrayList<>();

        for (Availability first : firstUserAvailability) {

            for (Availability second : secondUserAvailability) {

                // 🔥 SAME DAY REQUIRED
                if (!first.getDay().equals(second.getDay())) {
                    continue;
                }

                LocalTime overlapStart =
                        first.getStartTime().isAfter(second.getStartTime())
                                ? first.getStartTime()
                                : second.getStartTime();

                LocalTime overlapEnd =
                        first.getEndTime().isBefore(second.getEndTime())
                                ? first.getEndTime()
                                : second.getEndTime();

                // 🔥 VALID OVERLAP
                if (overlapStart.isBefore(overlapEnd)) {

                    long duration =
                            Duration.between(
                                    overlapStart,
                                    overlapEnd
                            ).toMinutes();

                    // 🔥 FILTER SHORT SLOTS
                    if (duration >= minimumDurationMinutes) {

                        suggestions.add(
                                SessionSuggestionResponseDTO.builder()
                                        .day(first.getDay())
                                        .suggestedStartTime(overlapStart)
                                        .suggestedEndTime(overlapEnd)
                                        .durationInMinutes(duration)
                                        .build()
                        );
                    }
                }
            }
        }

        // 🔥 SORT BY LONGEST SESSION FIRST
        suggestions.sort(
                (a, b) ->
                        Long.compare(
                                b.getDurationInMinutes(),
                                a.getDurationInMinutes()
                        )
        );

        return suggestions;
    }
}
