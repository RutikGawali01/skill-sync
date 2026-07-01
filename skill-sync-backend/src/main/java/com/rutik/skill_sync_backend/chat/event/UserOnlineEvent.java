package com.rutik.skill_sync_backend.chat.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Spring application event published when a user goes online.
 */
@Getter
@AllArgsConstructor
public class UserOnlineEvent {
    private final Long userId;
}
