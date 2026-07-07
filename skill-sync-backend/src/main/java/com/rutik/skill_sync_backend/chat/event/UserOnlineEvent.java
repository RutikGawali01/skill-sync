package com.rutik.skill_sync_backend.chat.event;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class UserOnlineEvent {
    private final Long userId;
}
