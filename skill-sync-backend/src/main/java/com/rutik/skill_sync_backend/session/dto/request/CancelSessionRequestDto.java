package com.rutik.skill_sync_backend.session.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelSessionRequestDto {

    @NotBlank(message = "Cancellation reason is required")
    @Size(
            max = 500,
            message = "Cancellation reason cannot exceed 500 characters"
    )
    private String reason;
}
