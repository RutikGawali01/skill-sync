package com.rutik.skill_sync_backend.test.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmitTestRequestDto {

    @NotNull(message = "Test id is required")
    private Long testId;

    @Valid
    @NotEmpty(message = "Answers are required")
    private List<SubmittedAnswerDto> answers;


}
