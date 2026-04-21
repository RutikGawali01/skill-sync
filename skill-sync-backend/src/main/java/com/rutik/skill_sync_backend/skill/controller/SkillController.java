package com.rutik.skill_sync_backend.skill.controller;

import com.rutik.skill_sync_backend.skill.dto.AddSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.AddUserSkillRequestDTO;
import com.rutik.skill_sync_backend.skill.dto.UserSkillResponseDTO;
import com.rutik.skill_sync_backend.skill.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    // TODO: replace with JWT extraction
    private Long getUserId() {
        return 1L;
    }

//    @PostMapping
//    public ResponseEntity<String> addSkill(@RequestBody AddSkillRequestDTO request) {
//        skillService.addSkill(request);
//        return ResponseEntity.ok("Skill added");
//    }

//    @PostMapping("/user")
//    public ResponseEntity<String> addUserSkill(@RequestBody AddUserSkillRequestDTO request) {
//        skillService.addUserSkill(getUserId(), request);
//        return ResponseEntity.ok("User skill added");
//    }

    @GetMapping("/user")
    public ResponseEntity<List<UserSkillResponseDTO>> getUserSkills() {
        return ResponseEntity.ok(skillService.getUserSkills(getUserId()));
    }
}