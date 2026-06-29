package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.availability.entity.Availability;
import com.rutik.skill_sync_backend.availability.repository.AvailabilityRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySeeder {

    private final AvailabilityRepository availabilityRepository;
    private final Random random = new Random();

    private static class SlotTemplate {
        DayOfWeek day;
        LocalTime start;
        LocalTime end;

        SlotTemplate(DayOfWeek day, String start, String end) {
            this.day = day;
            this.start = LocalTime.parse(start);
            this.end = LocalTime.parse(end);
        }
    }

    public void seed(List<User> users) {
//        if (availabilityRepository.count() > 0) {
//            log.info("Availability slots already exist. Skipping availability seeding.");
//            return;
//        }

        log.info("Creating Availability...");
        
        List<SlotTemplate> templates = List.of(
            new SlotTemplate(DayOfWeek.MONDAY, "18:00", "20:00"),
            new SlotTemplate(DayOfWeek.TUESDAY, "19:00", "21:00"),
            new SlotTemplate(DayOfWeek.WEDNESDAY, "20:00", "22:00"),
            new SlotTemplate(DayOfWeek.THURSDAY, "18:30", "20:30"),
            new SlotTemplate(DayOfWeek.FRIDAY, "17:00", "20:00"),
            new SlotTemplate(DayOfWeek.SATURDAY, "10:00", "13:00"),
            new SlotTemplate(DayOfWeek.SUNDAY, "14:00", "17:00")
        );

        List<Availability> toSave = new ArrayList<>();

        for (User user : users) {
            List<SlotTemplate> userTemplates = new ArrayList<>(templates);
            Collections.shuffle(userTemplates);

            int numSlots = random.nextInt(3) + 3; // 3 to 5 slots

            for (int i = 0; i < numSlots && i < userTemplates.size(); i++) {
                SlotTemplate t = userTemplates.get(i);
                toSave.add(Availability.builder()
                        .user(user)
                        .day(t.day)
                        .startTime(t.start)
                        .endTime(t.end)
                        .build());
            }
        }

        availabilityRepository.saveAll(toSave);
        log.info("Successfully seeded {} availability slots.", toSave.size());
    }
}
