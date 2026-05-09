package com.rutik.skill_sync_backend.test.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenRouterClient {

    private static final String OPENROUTER_API_URL =
            "https://openrouter.ai/api/v1/chat/completions";

    private static final String MODEL =
            "openai/gpt-4o-mini";

    private final RestTemplate restTemplate;

    @Value("${openrouter.api.key}")
    private String apiKey;

    public String generateMcqQuestions(String prompt) {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "messages", new Object[]{
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                }
        );

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                OPENROUTER_API_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        log.info("Received AI response from OpenRouter");

        return response.getBody();
    }
}