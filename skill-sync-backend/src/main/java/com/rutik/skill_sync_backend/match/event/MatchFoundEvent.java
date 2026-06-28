package com.rutik.skill_sync_backend.match.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MatchFoundEvent {
    private Long matchId;
    private Long userId;          // The user to notify
    private Long matchedUserId;   // The user they matched with
    private String matchedUserName;
    private String matchedSkillName;
}
