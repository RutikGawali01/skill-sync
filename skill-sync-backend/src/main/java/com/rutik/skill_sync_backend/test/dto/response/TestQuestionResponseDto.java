package com.rutik.skill_sync_backend.test.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestQuestionResponseDto {

    private Long questionId;

    private String question;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;
}
