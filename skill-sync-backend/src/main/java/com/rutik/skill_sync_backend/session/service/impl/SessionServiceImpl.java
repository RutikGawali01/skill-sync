package com.rutik.skill_sync_backend.session.service.impl;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.session.dto.request.CancelSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.CreateSessionRequestDto;
import com.rutik.skill_sync_backend.session.dto.request.UpdateSessionStatusRequestDto;
import com.rutik.skill_sync_backend.session.dto.response.SessionResponseDto;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.mapper.SessionMapper;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.session.service.interfaces.SessionService;
import com.rutik.skill_sync_backend.session.validator.*;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.SkillRepository;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import com.rutik.skill_sync_backend.session.event.SessionAcceptedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCompletedEvent;
import com.rutik.skill_sync_backend.session.event.SessionCancelledEvent;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final SessionMapper sessionMapper;
    private final SessionBookingValidator bookingValidator;
    private final SessionAvailabilityValidator availabilityValidator;
    private final SessionConflictValidator conflictValidator;
    private final SessionStateValidator stateValidator;
    private final SessionAuthorizationValidator authorizationValidator;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public SessionResponseDto createSession(
            Long requesterId,
            CreateSessionRequestDto dto
    ) {

        // ==========================================
        // FETCH REQUESTER
        // ==========================================

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Requester not found"
                        )
                );

        // ==========================================
        // FETCH PROVIDER
        // ==========================================

        User provider = userRepository.findById(dto.getProviderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Provider not found"
                        )
                );

        // ==========================================
        // FETCH SKILL
        // ==========================================

        Skill skill = skillRepository.findById(dto.getSkillId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found")
                );

        // ==========================================
        // VALIDATE PROVIDER OFFERS SKILL
        // ==========================================

        UserSkill providerSkill =
                userSkillRepository
                        .findByUserIdAndSkillIdAndType(
                                provider.getId(),
                                skill.getId(),
                                SkillType.OFFER
                        )
                        .orElse(null);

        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        bookingValidator.validateBasicBookingRules(
                requesterId,
                provider.getId(),
                providerSkill,
                dto
        );

        // ==========================================
        // DUPLICATE REQUEST CHECK
        // ==========================================

        boolean duplicateExists =
                sessionRepository
                        .existsByRequesterIdAndProviderIdAndSkillIdAndStartTimeAndStatus(
                                requester.getId(),
                                provider.getId(),
                                skill.getId(),
                                dto.getStartTime(),
                                SessionStatus.PENDING
                        );

        if (duplicateExists) {

            throw new BadRequestException(
                    "Duplicate pending session request already exists"
            );
        }

        // ==========================================
        // AVAILABILITY VALIDATION
        // ==========================================

        List<Availability> providerAvailabilities =
                provider.getAvailabilitySlots();

        availabilityValidator.validateProviderAvailability(
                providerAvailabilities,
                dto.getStartTime().getDayOfWeek(),
                dto.getStartTime().toLocalTime(),
                dto.getEndTime().toLocalTime()
        );

        // ==========================================
        // PROVIDER CONFLICT CHECK
        // ==========================================

        conflictValidator.validateProviderConflicts(

                sessionRepository.findProviderConflictingSessions(
                        provider.getId(),
                        dto.getStartTime(),
                        dto.getEndTime(),
                        List.of(
                                SessionStatus.PENDING,
                                SessionStatus.ACCEPTED
                        )
                )
        );

        // ==========================================
        // REQUESTER CONFLICT CHECK
        // ==========================================

        conflictValidator.validateRequesterConflicts(

                sessionRepository.findRequesterConflictingSessions(
                        requester.getId(),
                        dto.getStartTime(),
                        dto.getEndTime(),
                        List.of(
                                SessionStatus.PENDING,
                                SessionStatus.ACCEPTED
                        )
                )
        );

        // ==========================================
        // CREATE SESSION
        // ==========================================

        Session session = Session.builder()
                .requester(requester)
                .provider(provider)
                .skill(skill)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .message(dto.getMessage())
                .mode(dto.getMode())
                .status(SessionStatus.PENDING)
                .build();

        // ==========================================
        // SAVE SESSION
        // ==========================================

        Session savedSession =
                sessionRepository.save(session);

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return sessionMapper.toDto(savedSession);
    }

    @Override
    public SessionResponseDto updateSessionStatus(
            Long userId,
            Long sessionId,
            UpdateSessionStatusRequestDto dto
    ) {

        // ==========================================
        // FETCH USER
        // ==========================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // ==========================================
        // FETCH SESSION
        // ==========================================

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Session not found")
                );

        // ==========================================
        // ONLY PROVIDER CAN ACCEPT/REJECT
        // ==========================================

        authorizationValidator.validateProviderAction(
                session,
                user
        );

        // ==========================================
        // ACCEPT SESSION
        // ==========================================

        if (dto.getStatus() == SessionStatus.ACCEPTED) {

            stateValidator.validateAccept(session);

            session.setStatus(SessionStatus.ACCEPTED);

            session.setAcceptedAt(LocalDateTime.now());

            eventPublisher.publishEvent(SessionAcceptedEvent.builder()
                    .sessionId(session.getId())
                    .requesterId(session.getRequester().getId())
                    .providerId(session.getProvider().getId())
                    .skillName(session.getSkill().getName())
                    .build());
        }

        // ==========================================
        // REJECT SESSION
        // ==========================================

        else if (dto.getStatus() == SessionStatus.REJECTED) {

            stateValidator.validateReject(session);

            session.setStatus(SessionStatus.REJECTED);

            session.setRejectedAt(LocalDateTime.now());

            session.setRejectionReason(dto.getReason());
        }

        // ==========================================
        // INVALID STATUS
        // ==========================================

        else {

            throw new BadRequestException(
                    "Invalid status update operation"
            );
        }

        // ==========================================
        // SAVE SESSION
        // ==========================================

        Session updatedSession =
                sessionRepository.save(session);

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return sessionMapper.toDto(updatedSession);
    }

    @Override
    public SessionResponseDto cancelSession(
            Long userId,
            Long sessionId,
            CancelSessionRequestDto dto
    ) {

        // ==========================================
        // FETCH USER
        // ==========================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // ==========================================
        // FETCH SESSION
        // ==========================================

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Session not found")
                );

        // ==========================================
        // VALIDATE PARTICIPANT
        // ==========================================

        authorizationValidator.validateParticipant(
                session,
                user
        );

        // ==========================================
        // VALIDATE STATE
        // ==========================================

        stateValidator.validateCancel(session);

        // ==========================================
        // CANCEL SESSION
        // ==========================================

        session.setStatus(SessionStatus.CANCELLED);

        session.setCancelledAt(LocalDateTime.now());

        session.setCancellationReason(dto.getReason());

        Long otherPartyId = userId.equals(session.getRequester().getId()) 
                ? session.getProvider().getId() 
                : session.getRequester().getId();

        eventPublisher.publishEvent(SessionCancelledEvent.builder()
                .sessionId(session.getId())
                .cancelledById(userId)
                .otherPartyId(otherPartyId)
                .skillName(session.getSkill().getName())
                .reason(dto.getReason())
                .build());

        // ==========================================
        // SAVE SESSION
        // ==========================================

        Session updatedSession =
                sessionRepository.save(session);

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return sessionMapper.toDto(updatedSession);
    }

    @Override
    public SessionResponseDto completeSession(
            Long userId,
            Long sessionId
    ) {

        // ==========================================
        // FETCH USER
        // ==========================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // ==========================================
        // FETCH SESSION
        // ==========================================

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Session not found")
                );

        // ==========================================
        // ONLY PROVIDER CAN COMPLETE
        // ==========================================

        authorizationValidator.validateProviderAction(
                session,
                user
        );

        // ==========================================
        // VALIDATE STATE
        // ==========================================

        stateValidator.validateComplete(session);

        // ==========================================
        // COMPLETE SESSION
        // ==========================================

        session.setStatus(SessionStatus.COMPLETED);

        session.setCompletedAt(LocalDateTime.now());

        eventPublisher.publishEvent(SessionCompletedEvent.builder()
                .sessionId(session.getId())
                .requesterId(session.getRequester().getId())
                .providerId(session.getProvider().getId())
                .skillName(session.getSkill().getName())
                .build());

        // ==========================================
        // UPDATE USER METRICS
        // ==========================================

        updateUserSessionMetrics(
                session.getRequester(),
                session.getProvider()
        );

        // ==========================================
        // SAVE SESSION
        // ==========================================

        Session updatedSession =
                sessionRepository.save(session);

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return sessionMapper.toDto(updatedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SessionResponseDto> getMySessions(
            Long userId,
            SessionStatus status,
            Boolean upcoming,
            int page,
            int size
    ) {

        // ==========================================
        // VALIDATE USER
        // ==========================================

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        // ==========================================
        // PAGINATION
        // ==========================================

        Pageable pageable =
                PageRequest.of(page, size);

        // ==========================================
        // FETCH SESSIONS
        // ==========================================

        Page<Session> sessions =
                sessionRepository.findUserSessions(
                        userId,
                        status,
                        upcoming,
                        pageable
                );

        // ==========================================
        // MAP RESPONSE
        // ==========================================

        return sessions.map(sessionMapper::toDto);
    }


    private void updateUserSessionMetrics(
            User requester,
            User provider
    ) {

        // ==========================================
        // COMPLETED SESSION COUNT
        // ==========================================

        int reqSessions = requester.getCompletedSessions() == null ? 0 : requester.getCompletedSessions();
        requester.setCompletedSessions(reqSessions + 1);

        int provSessions = provider.getCompletedSessions() == null ? 0 : provider.getCompletedSessions();
        provider.setCompletedSessions(provSessions + 1);

        // ==========================================
        // GAMIFICATION
        // ==========================================

        int reqPoints = requester.getPoints() == null ? 0 : requester.getPoints();
        requester.setPoints(reqPoints + 10);

        int provPoints = provider.getPoints() == null ? 0 : provider.getPoints();
        provider.setPoints(provPoints + 15);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionResponseDto getSessionById(
            Long userId,
            Long sessionId
    ) {

        // ==========================================
        // FETCH SESSION
        // ==========================================

        Session session =
                sessionRepository.findDetailedSessionById(sessionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Session not found"
                                )
                        );

        // ==========================================
        // VALIDATE PARTICIPANT
        // ==========================================

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        authorizationValidator.validateParticipant(
                session,
                user
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        return sessionMapper.toDto(session);
    }

}
