package com.rutik.skill_sync_backend.session.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.session.dto.request.CreateSessionRequestDto;
import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class SessionBookingValidator {

    private static final long MIN_DURATION_MINUTES = 30;
    private static final long MAX_DURATION_HOURS = 3;

    public void validateBasicBookingRules(
            Long requesterId,
            Long providerId,
            UserSkill providerSkill,
            CreateSessionRequestDto dto
    ) {

        // ==========================================
        // SELF BOOKING CHECK
        // ==========================================

        if (requesterId.equals(providerId)) {

            throw new BadRequestException(
                    "You cannot book a session with yourself"
            );
        }

        // ==========================================
        // PROVIDER SKILL VALIDATION
        // ==========================================

        if (providerSkill == null) {

            throw new BadRequestException(
                    "Provider does not offer this skill"
            );
        }

        // ==========================================
        // TIME VALIDATION
        // ==========================================

        if (dto.getEndTime().isBefore(dto.getStartTime())) {

            throw new BadRequestException(
                    "End time must be after start time"
            );
        }

        // ==========================================
        // PAST TIME VALIDATION
        // ==========================================

        if (dto.getStartTime().isBefore(LocalDateTime.now())) {

            throw new BadRequestException(
                    "Cannot book session in the past"
            );
        }

        // ==========================================
        // DURATION VALIDATION
        // ==========================================

        long durationMinutes = Duration.between(
                dto.getStartTime(),
                dto.getEndTime()
        ).toMinutes();

        if (durationMinutes < MIN_DURATION_MINUTES) {

            throw new BadRequestException(
                    "Minimum session duration is 30 minutes"
            );
        }

        if (durationMinutes > (MAX_DURATION_HOURS * 60)) {

            throw new BadRequestException(
                    "Maximum session duration is 3 hours"
            );
        }

        // ==========================================
        // MODE VALIDATION
        // ==========================================

        if (dto.getMode() != SessionMode.DIRECT_LEARNING) {

            throw new BadRequestException(
                    "Only DIRECT_LEARNING mode is currently supported"
            );
        }
    }
}