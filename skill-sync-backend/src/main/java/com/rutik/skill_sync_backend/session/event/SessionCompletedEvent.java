package com.rutik.skill_sync_backend.session.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionCompletedEvent {
    private Long sessionId;
    private Long requesterId; // One of the users in the session
    private Long providerId;  // The other user in the session
    private String skillName;
}
