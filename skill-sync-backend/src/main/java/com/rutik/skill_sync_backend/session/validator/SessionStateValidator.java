package com.rutik.skill_sync_backend.session.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import org.springframework.stereotype.Component;

@Component
public class SessionStateValidator {

    // ==========================================
    // ACCEPT VALIDATION
    // ==========================================

    public void validateAccept(Session session) {

        if (session.getStatus() != SessionStatus.PENDING) {

            throw new BadRequestException(
                    "Only pending sessions can be accepted"
            );
        }
    }

    // ==========================================
    // REJECT VALIDATION
    // ==========================================

    public void validateReject(Session session) {

        if (session.getStatus() != SessionStatus.PENDING) {

            throw new BadRequestException(
                    "Only pending sessions can be rejected"
            );
        }
    }

    // ==========================================
    // CANCEL VALIDATION
    // ==========================================

    public void validateCancel(Session session) {

        if (
                session.getStatus() == SessionStatus.COMPLETED
                        ||
                        session.getStatus() == SessionStatus.CANCELLED
                        ||
                        session.getStatus() == SessionStatus.REJECTED
        ) {

            throw new BadRequestException(
                    "This session cannot be cancelled"
            );
        }
    }

    // ==========================================
    // COMPLETE VALIDATION
    // ==========================================

    public void validateComplete(Session session) {

        if (session.getStatus() != SessionStatus.ACCEPTED) {

            throw new BadRequestException(
                    "Only accepted sessions can be completed"
            );
        }
    }
}