package com.rutik.skill_sync_backend.session.validator;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import org.springframework.stereotype.Component;

@Component
public class SessionReviewValidator {

    public void validateReviewEligibility(
            Session session
    ) {

        if (session.getStatus() != SessionStatus.COMPLETED) {

            throw new BadRequestException(
                    "Only completed sessions can be reviewed"
            );
        }
    }
}
