package com.rutik.skill_sync_backend.session.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.session.entity.Session;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SessionConflictValidator {

    public void validateProviderConflicts(
            List<Session> conflictingSessions
    ) {

        if (!conflictingSessions.isEmpty()) {

            throw new BadRequestException(
                    "Provider already has another session during this time"
            );
        }
    }

    public void validateRequesterConflicts(
            List<Session> conflictingSessions
    ) {

        if (!conflictingSessions.isEmpty()) {

            throw new BadRequestException(
                    "You already have another session during this time"
            );
        }
    }
}
