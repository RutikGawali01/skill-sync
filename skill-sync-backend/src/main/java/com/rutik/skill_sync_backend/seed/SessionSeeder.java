package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.availability.repository.AvailabilityRepository;
import com.rutik.skill_sync_backend.match.entity.Match;
import com.rutik.skill_sync_backend.match.repository.MatchRepository;
import com.rutik.skill_sync_backend.match.service.interfaces.MatchService;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.skill.entity.Skill;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class SessionSeeder {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final AvailabilityRepository availabilityRepository;
    private final MatchRepository matchRepository;
    private final MatchService matchService;
    private final Random random = new Random();

    @Transactional
    public void clear() {
        log.info("Deleting all sessions from repository...");
        sessionRepository.deleteAll();
    }

    @Transactional
    public List<Session> seed() {
        if (sessionRepository.count() > 0) {
            log.info("Sessions already exist. Skipping session seeding.");
            return sessionRepository.findAll().stream()
                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                    .toList();
        }

        log.info("Starting Session seeding...");
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.warn("No users found to seed sessions.");
            return Collections.emptyList();
        }

        // 1. Calculate matches if none exist
        if (matchRepository.count() == 0) {
            log.info("Calculating matches to seed matches table...");
            for (User u : users) {
                try {
                    matchService.findMatches(u.getId());
                } catch (Exception e) {
                    log.error("Failed to calculate matches for user {}: {}", u.getId(), e.getMessage());
                }
            }
        }

        List<Match> matches = matchRepository.findAll();
        if (matches.isEmpty()) {
            log.warn("No matches found. Cannot seed matched sessions.");
            return Collections.emptyList();
        }

        List<Session> sessionsToSave = new ArrayList<>();
        Map<Long, Integer> completedCountMap = new HashMap<>();
        for (User u : users) {
            completedCountMap.put(u.getId(), 0);
        }

        // Let's generate completed sessions between matched users
        // Guarantee at least 4 completed sessions per user
        for (User u : users) {
            int completedNeeded = 4 - completedCountMap.getOrDefault(u.getId(), 0);
            if (completedNeeded <= 0) continue;

            // Find matches for this user
            List<Match> userMatches = matches.stream()
                    .filter(m -> m.getUserA().getId().equals(u.getId()) || m.getUserB().getId().equals(u.getId()))
                    .toList();

            if (userMatches.isEmpty()) continue;

            for (int i = 0; i < completedNeeded; i++) {
                Match match = userMatches.get(random.nextInt(userMatches.size()));
                User other = match.getUserA().getId().equals(u.getId()) ? match.getUserB() : match.getUserA();

                // Find matching skill and roles
                SkillRole skillRole = determineSkillAndRoles(u, other);
                if (skillRole == null) continue;

                // Pick an availability slot of the teacher (provider)
                LocalDateTime[] times = determineSessionTimes(skillRole.teacher, true); // past

                Session session = createSession(skillRole, times[0], times[1], SessionStatus.COMPLETED);
                sessionsToSave.add(session);

                completedCountMap.put(u.getId(), completedCountMap.getOrDefault(u.getId(), 0) + 1);
                completedCountMap.put(other.getId(), completedCountMap.getOrDefault(other.getId(), 0) + 1);
            }
        }

        // Save completed sessions first to flush IDs
        List<Session> savedCompleted = sessionRepository.saveAll(sessionsToSave);
        log.info("Seeded {} completed sessions to satisfy user requirements.", savedCompleted.size());

        List<Session> otherSessions = new ArrayList<>();
        // Now seed PENDING, ACCEPTED, CANCELLED, and REJECTED sessions for each user to have variety
        for (User u : users) {
            List<Match> userMatches = matches.stream()
                    .filter(m -> m.getUserA().getId().equals(u.getId()) || m.getUserB().getId().equals(u.getId()))
                    .toList();

            if (userMatches.isEmpty()) continue;

            // Pick a match
            Match m = userMatches.get(random.nextInt(userMatches.size()));
            User other = m.getUserA().getId().equals(u.getId()) ? m.getUserB() : m.getUserA();
            SkillRole skillRole = determineSkillAndRoles(u, other);
            if (skillRole == null) continue;

            // Seed 1 Accepted session (future)
            LocalDateTime[] acceptedTimes = determineSessionTimes(skillRole.teacher, false);
            otherSessions.add(createSession(skillRole, acceptedTimes[0], acceptedTimes[1], SessionStatus.ACCEPTED));

            // Seed 1 Pending session (future)
            LocalDateTime[] pendingTimes = determineSessionTimes(skillRole.teacher, false);
            otherSessions.add(createSession(skillRole, pendingTimes[0], pendingTimes[1], SessionStatus.PENDING));

            // Seed 1 Cancelled session (past)
            LocalDateTime[] cancelledTimes = determineSessionTimes(skillRole.teacher, true);
            Session cancelled = createSession(skillRole, cancelledTimes[0], cancelledTimes[1], SessionStatus.CANCELLED);
            cancelled.setCancelledAt(cancelledTimes[0].minusDays(1));
            cancelled.setCancellationReason("Sorry, something urgent came up at work.");
            otherSessions.add(cancelled);

            // Seed 1 Rejected session (past)
            LocalDateTime[] rejectedTimes = determineSessionTimes(skillRole.teacher, true);
            Session rejected = createSession(skillRole, rejectedTimes[0], rejectedTimes[1], SessionStatus.REJECTED);
            rejected.setRejectedAt(rejectedTimes[0].minusDays(2));
            rejected.setRejectionReason("The topic is outside my current area of expertise.");
            otherSessions.add(rejected);
        }

        sessionRepository.saveAll(otherSessions);
        log.info("Seeded additional sessions (Accepted, Pending, Cancelled, Rejected).");

        return sessionRepository.findAll().stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .toList();
    }

    private Session createSession(SkillRole sr, LocalDateTime start, LocalDateTime end, SessionStatus status) {
        Session session = Session.builder()
                .requester(sr.learner)
                .provider(sr.teacher)
                .skill(sr.skill)
                .startTime(start)
                .endTime(end)
                .status(status)
                .mode(random.nextBoolean() ? SessionMode.DIRECT_LEARNING : SessionMode.SKILL_EXCHANGE)
                .message("Hi! I'd love to set up a learning session for " + sr.skill.getName() + ".")
                .meetingLink("https://meet.google.com/abc-defg-hij")
                .notes("Let's cover fundamentals, basic concepts, and do a quick hands-on project.")
                .createdAt(start.minusDays(3))
                .build();

        if (status == SessionStatus.ACCEPTED) {
            session.setAcceptedAt(start.minusDays(2));
        } else if (status == SessionStatus.COMPLETED) {
            session.setAcceptedAt(start.minusDays(2));
            session.setCompletedAt(end);
        }
        return session;
    }

    private SkillRole determineSkillAndRoles(User uA, User uB) {
        List<UserSkill> skillsA = userSkillRepository.findByUserId(uA.getId());
        List<UserSkill> skillsB = userSkillRepository.findByUserId(uB.getId());

        // Find wanted skill of A offered by B
        for (UserSkill wantA : skillsA) {
            if (wantA.getType() == SkillType.WANT) {
                for (UserSkill offerB : skillsB) {
                    if (offerB.getType() == SkillType.OFFER && offerB.getSkill().getId().equals(wantA.getSkill().getId())) {
                        return new SkillRole(offerB.getSkill(), uB, uA);
                    }
                }
            }
        }

        // Find wanted skill of B offered by A
        for (UserSkill wantB : skillsB) {
            if (wantB.getType() == SkillType.WANT) {
                for (UserSkill offerA : skillsA) {
                    if (offerA.getType() == SkillType.OFFER && offerA.getSkill().getId().equals(wantB.getSkill().getId())) {
                        return new SkillRole(offerA.getSkill(), uA, uB);
                    }
                }
            }
        }

        return null;
    }

    private LocalDateTime[] determineSessionTimes(User provider, boolean past) {
        List<Availability> slots = availabilityRepository.findByUserIdOrderByDayAscStartTimeAsc(provider.getId());
        Availability slot;
        if (slots.isEmpty()) {
            slot = Availability.builder()
                    .day(DayOfWeek.WEDNESDAY)
                    .startTime(LocalTime.of(15, 0))
                    .endTime(LocalTime.of(17, 0))
                    .build();
        } else {
            slot = slots.get(random.nextInt(slots.size()));
        }

        LocalDateTime baseDate = LocalDateTime.now();
        if (past) {
            baseDate = baseDate.minusDays(random.nextInt(115) + 5);
        } else {
            baseDate = baseDate.plusDays(random.nextInt(13) + 2);
        }

        LocalDateTime sessionStart = baseDate.with(TemporalAdjusters.nextOrSame(slot.getDay()))
                .withHour(slot.getStartTime().getHour())
                .withMinute(slot.getStartTime().getMinute())
                .withSecond(0)
                .withNano(0);
        LocalDateTime sessionEnd = sessionStart.plusMinutes(java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes());

        return new LocalDateTime[]{sessionStart, sessionEnd};
    }

    private static class SkillRole {
        Skill skill;
        User teacher;
        User learner;

        SkillRole(Skill skill, User teacher, User learner) {
            this.skill = skill;
            this.teacher = teacher;
            this.learner = learner;
        }
    }
}
