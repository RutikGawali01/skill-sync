package com.rutik.skill_sync_backend.common.exception;

public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(message, "FORBIDDEN");
    }
}
