package com.rutik.skill_sync_backend.common.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {

    private boolean success;
    private String message;
    private String errorCode;
    private LocalDateTime timestamp;
}