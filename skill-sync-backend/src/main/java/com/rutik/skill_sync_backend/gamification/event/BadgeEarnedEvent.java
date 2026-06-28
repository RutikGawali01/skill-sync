package com.rutik.skill_sync_backend.gamification.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BadgeEarnedEvent {
    private Long userId;        // The user who earned the badge and will be notified
    private Long badgeId;
    private String badgeName;
    private String badgeDescription;
}
