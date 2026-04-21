package com.rutik.skill_sync_backend.common.response;

import lombok.*;

import java.time.LocalDateTime;

import lombok.*;

        import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    // ✅ SUCCESS WITH DATA
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ✅ SUCCESS WITHOUT DATA
    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }
}