package com.rutik.skill_sync_backend.common.exception;

public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
}
