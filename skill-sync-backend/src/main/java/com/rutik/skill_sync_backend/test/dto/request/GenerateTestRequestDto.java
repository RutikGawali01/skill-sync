package com.rutik.skill_sync_backend.test.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GenerateTestRequestDto {

    @NotNull(message = "User skill id is required")
    private Long userSkillId;
}
