package com.rutik.skill_sync_backend.session.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
//why - Avoid exposing full User entity.
public class SessionParticipantDto {

    private Long id;

    private String name;

    private String profilePicUrl;

    private Double rating;

    private Integer level;
}