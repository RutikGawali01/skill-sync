package com.rutik.skill_sync_backend.session.service.interfaces;

import com.rutik.skill_sync_backend.session.dto.request.CancelSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.CreateSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.UpdateSessionStatusRequestDto;
import com.rutik.skill_sync_backend.session.dto.response.SessionResponseDto;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import org.springframework.data.domain.Page;

public interface SessionService {

    SessionResponseDto createSession(
            Long requesterId,
            CreateSessionRequestDto requestDto
    );

    SessionResponseDto updateSessionStatus(
            Long userId,
            Long sessionId,
            UpdateSessionStatusRequestDto requestDto
    );

    SessionResponseDto cancelSession(
            Long userId,
            Long sessionId,
            CancelSessionRequestDto requestDto
    );

    SessionResponseDto completeSession(
            Long userId,
            Long sessionId
    );

    Page<SessionResponseDto> getMySessions(
            Long userId,
            SessionStatus status,
            Boolean upcoming,
            int page,
            int size
    );

    SessionResponseDto getSessionById(
            Long userId,
            Long sessionId
    );
}