package com.rutik.skill_sync_backend.session.dto.request;

import com.rutik.skill_sync_backend.session.enums.SessionMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateSessionRequestDto {

    @NotNull(message = "Provider id is required")
    private Long providerId;

    @NotNull(message = "Skill id is required")
    private Long skillId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in future")
    private LocalDateTime endTime;

    @Size(
            max = 1000,
            message = "Message cannot exceed 1000 characters"
    )
    private String message;

    @NotNull(message = "Session mode is required")
    private SessionMode mode;
}