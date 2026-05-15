package com.rutik.skill_sync_backend.session.dto.request;

import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import lombok.Data;

@Data
public class SessionFilterRequestDto {

    private SessionStatus status;

    private Boolean upcoming;

    private Integer page = 0;

    private Integer size = 10;
}
