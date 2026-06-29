package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionMode;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.skill.repository.UserSkillRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class SessionSeeder {

    private final SessionRepository sessionRepository;
    private final UserSkillRepository userSkillRepository;
    private final Random random = new Random();

    @Transactional
    public List<Session> seed() {
//        if (sessionRepository.count() > 0) {
//            log.info("Sessions already exist. Skipping session seeding.");
//            return sessionRepository.findAll().stream()
//                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
//                    .toList();
//        }

        log.info("Generating Sessions...");
        List<UserSkill> allUserSkills = userSkillRepository.findAll();
        List<Session> createdSessions = new ArrayList<>();

        // Group by user
        List<UserSkill> offers = allUserSkills.stream()
                .filter(us -> us.getType() == SkillType.OFFER)
                .toList();
        List<UserSkill> wants = allUserSkills.stream()
                .filter(us -> us.getType() == SkillType.WANT)
                .toList();

        // Target to generate 40 sessions
        int targetSessions = 40;
        int completedLimit = 24;  // 60%
        int acceptedLimit = 8;    // 20%
        int pendingLimit = 4;     // 10%
        int cancelledLimit = 4;   // 10%

        int completedCount = 0;
        int acceptedCount = 0;
        int pendingCount = 0;
        int cancelledCount = 0;

        // Iterate wants and find matching offers from different users
        for (UserSkill want : wants) {
            if (createdSessions.size() >= targetSessions) break;

            User learner = want.getUser();
            Long skillId = want.getSkill().getId();

            // Find someone offering this skill
            UserSkill offer = offers.stream()
                    .filter(o -> o.getSkill().getId().equals(skillId) && !o.getUser().getId().equals(learner.getId()))
                    .findFirst()
                    .orElse(null);

            if (offer != null) {
                User teacher = offer.getUser();

                // Select status based on distribution limits
                SessionStatus status;
                if (completedCount < completedLimit) {
                    status = SessionStatus.COMPLETED;
                    completedCount++;
                } else if (acceptedCount < acceptedLimit) {
                    status = SessionStatus.ACCEPTED;
                    acceptedCount++;
                } else if (pendingCount < pendingLimit) {
                    status = SessionStatus.PENDING;
                    pendingCount++;
                } else if (cancelledCount < cancelledLimit) {
                    status = SessionStatus.CANCELLED;
                    cancelledCount++;
                } else {
                    status = SessionStatus.COMPLETED;
                    completedCount++;
                }

                // Random datetime within the last 6 months (approx 180 days)
                int daysAgo = random.nextInt(180) + 1;
                LocalDateTime startTime = LocalDateTime.now().minusDays(daysAgo).withHour(10 + random.nextInt(8)).withMinute(0);
                LocalDateTime endTime = startTime.plusHours(1 + random.nextInt(2));

                Session session = Session.builder()
                        .requester(learner)
                        .provider(teacher)
                        .skill(want.getSkill())
                        .startTime(startTime)
                        .endTime(endTime)
                        .status(status)
                        .mode(random.nextBoolean() ? SessionMode.DIRECT_LEARNING : SessionMode.SKILL_EXCHANGE)
                        .message("Let's connect for a session on " + want.getSkill().getName() + ".")
                        .meetingLink("https://meet.google.com/abc-defg-hij")
                        .notes("Discussion on basic concepts and practical projects.")
                        .createdAt(startTime.minusDays(3))
                        .build();

                // Populate status dates
                if (status == SessionStatus.ACCEPTED) {
                    session.setAcceptedAt(startTime.minusDays(2));
                } else if (status == SessionStatus.COMPLETED) {
                    session.setAcceptedAt(startTime.minusDays(2));
                    session.setCompletedAt(endTime);
                } else if (status == SessionStatus.CANCELLED) {
                    session.setCancelledAt(startTime.minusDays(1));
                    session.setCancellationReason("Unavoidable work engagement popped up.");
                }

                createdSessions.add(session);
            }
        }

        sessionRepository.saveAll(createdSessions);
        log.info("Successfully seeded {} sessions ({} Completed, {} Accepted, {} Pending, {} Cancelled).",
                createdSessions.size(), completedCount, acceptedCount, pendingCount, cancelledCount);

        return createdSessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .toList();
    }
}
