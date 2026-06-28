package com.rutik.skill_sync_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync  // Required for @Async to work on notification event listeners
public class SkillSyncBackendApplication {


	public static void main(String[] args) {
		SpringApplication.run(SkillSyncBackendApplication.class, args);
	}

}
