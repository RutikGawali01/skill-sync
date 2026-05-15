package com.rutik.skill_sync_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SkillSyncBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillSyncBackendApplication.class, args);
	}

}
