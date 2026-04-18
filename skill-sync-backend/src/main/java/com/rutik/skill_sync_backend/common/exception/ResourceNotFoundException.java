package com.rutik.skill_sync_backend.common.exception;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}