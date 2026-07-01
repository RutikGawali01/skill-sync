package com.rutik.skill_sync_backend.chat.dto.response;

import lombok.*;

/**
 * DTO representing a conversation participant.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantDto {
    private Long id;
    private String name;
    private String profilePicUrl;
    private boolean online;
}
