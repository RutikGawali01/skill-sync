package com.rutik.skill_sync_backend.review.event;

import lombok.Builder;
import lombok.Getter;

// whhy -   represents Review successfully submitted"
@Getter
@Builder
public class ReviewSubmittedEvent {

    private Long reviewId;

    private Long reviewerId;

    private Long revieweeId;

    private Long sessionId;

    private Integer overallRating;
}
