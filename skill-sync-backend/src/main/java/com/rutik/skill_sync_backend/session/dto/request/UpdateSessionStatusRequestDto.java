package com.rutik.skill_sync_backend.session.dto.request;

import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateSessionStatusRequestDto {

    @NotNull(message = "Session status is required")
    private SessionStatus status;

    @Size(
            max = 500,
            message = "Reason cannot exceed 500 characters"
    )
    private String reason;
}
