package com.rutik.skill_sync_backend.common.exception;

import lombok.Getter;

//Base Exception (Parent Exception).
@Getter
public class ApiException extends RuntimeException {

    private final String errorCode;

    public ApiException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
