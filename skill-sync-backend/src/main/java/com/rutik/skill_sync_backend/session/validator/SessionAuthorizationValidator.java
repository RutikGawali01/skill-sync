package com.rutik.skill_sync_backend.session.validator;


import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class SessionAuthorizationValidator {

    // ==========================================
    // PROVIDER ACTION VALIDATION
    // ==========================================

    public void validateProviderAction(
            Session session,
            User user
    ) {

        if (!session.getProvider().getId().equals(user.getId())) {

            throw new UnauthorizedException(
                    "Only provider can perform this action"
            );
        }
    }

    // ==========================================
    // PARTICIPANT VALIDATION
    // ==========================================

    public void validateParticipant(
            Session session,
            User user
    ) {

        boolean isRequester =
                session.getRequester().getId().equals(user.getId());

        boolean isProvider =
                session.getProvider().getId().equals(user.getId());

        if (!isRequester && !isProvider) {

            throw new UnauthorizedException(
                    "You are not authorized for this session"
            );
        }
    }
}
