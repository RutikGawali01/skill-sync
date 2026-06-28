package com.rutik.skill_sync_backend.session.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionCancelledEvent {
    private Long sessionId;
    private Long cancelledById; // Who cancelled it
    private Long otherPartyId;  // The user who should receive the notification
    private String skillName;
    private String reason;
}
