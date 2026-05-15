package com.rutik.skill_sync_backend.session.dto.response;

import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponseDto {

    private Long id;

    private SessionParticipantDto requester;

    private SessionParticipantDto provider;

    private SessionSkillDto skill;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private SessionStatus status;

    private SessionMode mode;

    private String message;

    private String meetingLink;

    private String rejectionReason;

    private String cancellationReason;

    private LocalDateTime acceptedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime cancelledAt;

    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
}
