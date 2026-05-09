package com.rutik.skill_sync_backend.test.dto.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class SubmittedAnswerDto {

    @NotNull(message = "Question id is required")
    private Long questionId;

    @NotBlank(message = "Selected answer is required")
    private String selectedAnswer;
}