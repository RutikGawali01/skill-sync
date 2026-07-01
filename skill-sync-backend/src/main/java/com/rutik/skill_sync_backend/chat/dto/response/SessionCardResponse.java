package com.rutik.skill_sync_backend.chat.dto.response;

import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO representing session metadata for rendering a Session Card on the chat timeline.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionCardResponse {
    private Long id;
    private String skillOffered;
    private String skillRequested;
    private String teacherName;
    private String learnerName;
    private String teacherProfilePicUrl;
    private String learnerProfilePicUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private Long durationMinutes;
    private SessionMode mode;
    private String meetingLink;
    private SessionStatus status;
    private LocalDateTime createdTime;
    private LocalDateTime completedTime;
    private boolean showReviewButton;
    private boolean reviewSubmitted;
    private Long reviewId;
    private Integer reviewRating;
    private String reviewComment;
}
