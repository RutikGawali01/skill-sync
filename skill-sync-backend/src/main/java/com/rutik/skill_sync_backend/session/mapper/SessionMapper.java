package com.rutik.skill_sync_backend.session.mapper;

import com.rutik.skill_sync_backend.session.dto.response.SessionParticipantDto;
import com.rutik.skill_sync_backend.session.dto.response.SessionResponseDto;
import com.rutik.skill_sync_backend.session.dto.response.SessionSkillDto;
import com.rutik.skill_sync_backend.session.entity.Session;
import org.springframework.stereotype.Component;

@Component
public class SessionMapper {

    public SessionResponseDto toDto(Session session) {

        return SessionResponseDto.builder()

                .id(session.getId())

                .requester(
                        SessionParticipantDto.builder()
                                .id(session.getRequester().getId())
                                .name(session.getRequester().getName())
                                .profilePicUrl(
                                        session.getRequester().getProfilePicUrl()
                                )
                                .rating(session.getRequester().getRating())
                                .level(session.getRequester().getLevel())
                                .build()
                )

                .provider(
                        SessionParticipantDto.builder()
                                .id(session.getProvider().getId())
                                .name(session.getProvider().getName())
                                .profilePicUrl(
                                        session.getProvider().getProfilePicUrl()
                                )
                                .rating(session.getProvider().getRating())
                                .level(session.getProvider().getLevel())
                                .build()
                )

                .skill(
                        SessionSkillDto.builder()
                                .id(session.getSkill().getId())
                                .name(session.getSkill().getName())
                                .category(session.getSkill().getCategory())
                                .build()
                )

                .startTime(session.getStartTime())
                .endTime(session.getEndTime())

                .status(session.getStatus())

                .mode(session.getMode())

                .message(session.getMessage())

                .meetingLink(session.getMeetingLink())

                .rejectionReason(session.getRejectionReason())

                .cancellationReason(session.getCancellationReason())

                .acceptedAt(session.getAcceptedAt())

                .rejectedAt(session.getRejectedAt())

                .cancelledAt(session.getCancelledAt())

                .completedAt(session.getCompletedAt())

                .createdAt(session.getCreatedAt())

                .build();
    }
}
