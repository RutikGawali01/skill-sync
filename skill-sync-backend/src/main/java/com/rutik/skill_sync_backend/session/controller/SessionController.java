package com.rutik.skill_sync_backend.session.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.session.dto.request.CancelSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.CreateSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.UpdateSessionStatusRequestDto;
import com.rutik.skill_sync_backend.session.dto.response.SessionResponseDto;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.service.interfaces.SessionService;
import com.rutik.skill_sync_backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;


@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ApiResponse<SessionResponseDto> createSession(
            @Valid @RequestBody CreateSessionRequestDto requestDto,
            Authentication auth
    ) {

        // ==========================================
        // AUTHENTICATED USER
        // ==========================================

        User requester = (User) auth.getPrincipal();

        // ==========================================
        // CREATE SESSION
        // ==========================================

        SessionResponseDto response =
                sessionService.createSession(
                        requester.getId(),
                        requestDto
                );

        // ==========================================
        // RESPONSE
        // ==========================================

        return ApiResponse.success(
                "Session request created successfully",
                response
        );
    }



    @PutMapping("/{sessionId}/status")
    public ApiResponse<SessionResponseDto> updateStatus(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateSessionStatusRequestDto requestDto,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        SessionResponseDto response =
                sessionService.updateSessionStatus(
                        user.getId(),
                        sessionId,
                        requestDto
                );

        return ApiResponse.success(
                "Session status updated successfully",
                response
        );
    }


    @PostMapping("/{sessionId}/cancel")
    public ApiResponse<SessionResponseDto> cancelSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody CancelSessionRequestDto requestDto,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        SessionResponseDto response =
                sessionService.cancelSession(
                        user.getId(),
                        sessionId,
                        requestDto
                );

        return ApiResponse.success(
                "Session cancelled successfully",
                response
        );
    }

    @PostMapping("/{sessionId}/complete")
    public ApiResponse<SessionResponseDto> completeSession(
            @PathVariable Long sessionId,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        SessionResponseDto response =
                sessionService.completeSession(
                        user.getId(),
                        sessionId
                );

        return ApiResponse.success(
                "Session completed successfully",
                response
        );
    }

    @GetMapping("/me")
    public ApiResponse<Page<SessionResponseDto>> getMySessions(
            @RequestParam(required = false)
            SessionStatus status,

            @RequestParam(required = false)
            Boolean upcoming,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            Authentication auth
    ) {

        // ==========================================
        // AUTH USER
        // ==========================================

        User user = (User) auth.getPrincipal();

        // ==========================================
        // FETCH SESSIONS
        // ==========================================

        Page<SessionResponseDto> response =
                sessionService.getMySessions(
                        user.getId(),
                        status,
                        upcoming,
                        page,
                        size
                );

        // ==========================================
        // RESPONSE
        // ==========================================

        return ApiResponse.success(
                "Sessions fetched successfully",
                response
        );
    }

    @GetMapping("/{sessionId}")
    public ApiResponse<SessionResponseDto> getSessionById(
            @PathVariable Long sessionId,
            Authentication auth
    ) {

        User user = (User) auth.getPrincipal();

        SessionResponseDto response =
                sessionService.getSessionById(
                        user.getId(),
                        sessionId
                );

        return ApiResponse.success(
                "Session fetched successfully",
                response
        );
    }
}