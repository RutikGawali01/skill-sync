package com.rutik.skill_sync_backend.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {
    private String email;
    private String name;
}
