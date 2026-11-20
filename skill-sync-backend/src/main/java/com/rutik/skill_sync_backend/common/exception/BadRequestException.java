package com.rutik.skill_sync_backend.common.exception;

// ApiException --> for automatically gets error code
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(message, "BAD_REQUEST");
    }
}
