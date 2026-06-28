package com.rutik.skill_sync_backend.session.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionAcceptedEvent {
    private Long sessionId;
    private Long requesterId; // The user who requested the session and will receive the notification
    private Long providerId;  // The user who accepted the session
    private String skillName;
}
