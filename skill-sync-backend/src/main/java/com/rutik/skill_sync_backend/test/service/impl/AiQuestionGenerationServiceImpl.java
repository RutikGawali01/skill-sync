package com.rutik.skill_sync_backend.test.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.test.client.OpenRouterClient;
import com.rutik.skill_sync_backend.test.entity.TestQuestion;
import com.rutik.skill_sync_backend.test.service.Interface.AiQuestionGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiQuestionGenerationServiceImpl implements AiQuestionGenerationService {

    private final OpenRouterClient openRouterClient;

    @Override
    public List<TestQuestion> generateQuestions(UserSkill userSkill) {

        log.info(
                "Generating AI questions for skill: {} and level: {}",
                userSkill.getSkill().getName(),
                userSkill.getLevel()
        );

        try {

            String prompt = buildPrompt(userSkill);

            String aiResponse =
                    openRouterClient.generateMcqQuestions(prompt);

            log.info("RAW AI RESPONSE : {}", aiResponse);


            return parseAiQuestions(aiResponse);

        } catch (Exception ex) {

            log.error(
                    "Failed to generate AI questions for skill: {}",
                    userSkill.getSkill().getName(),
                    ex
            );

            throw new BadRequestException(
                    "Failed to generate verification test questions"
            );
        }
    }

    private String buildPrompt(UserSkill userSkill) {

        return """
            Generate exactly 10 multiple choice questions.

            Skill: %s
            Difficulty Level: %s

            Rules:
            - Questions must be practical and concept-based
            - Avoid repeated questions
            - Each question must have exactly 4 options
            - Only one correct answer
            - Questions should match the declared skill level
            - Return ONLY valid JSON
            - No markdown
            - No explanation text

            JSON Format:
            [
              {
                "question": "Question here",
                "optionA": "Option A",
                "optionB": "Option B",
                "optionC": "Option C",
                "optionD": "Option D",
                "correctAnswer": "Option A"
              }
            ]
            """.formatted(
                userSkill.getSkill().getName(),
                userSkill.getLevel().name()
        );
    }

    private List<TestQuestion> parseAiQuestions(String aiResponse) {

        try {

            ObjectMapper objectMapper = new ObjectMapper();

            JsonNode rootNode = objectMapper.readTree(aiResponse);

            String content = rootNode
                    .get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

            // Remove markdown if AI accidentally sends it
            content = content
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            JsonNode questionsNode =
                    objectMapper.readTree(content);

            List<TestQuestion> questions = new ArrayList<>();

            for (JsonNode questionNode : questionsNode) {

                validateQuestionNode(questionNode);

                TestQuestion question = TestQuestion.builder()
                        .question(questionNode.get("question").asText())
                        .optionA(questionNode.get("optionA").asText())
                        .optionB(questionNode.get("optionB").asText())
                        .optionC(questionNode.get("optionC").asText())
                        .optionD(questionNode.get("optionD").asText())
                        .correctAnswer(
                                questionNode.get("correctAnswer").asText()
                        )
                        .build();

                questions.add(question);
            }

            if (questions.size() != 10) {

                throw new BadRequestException(
                        "AI did not generate exactly 10 questions"
                );
            }

            return questions;

        } catch (Exception ex) {

            log.error("Failed to parse AI response", ex);

            throw new BadRequestException(
                    "Invalid AI response format"
            );
        }
    }

    private void validateQuestionNode(JsonNode questionNode) {

        List<String> requiredFields = List.of(
                "question",
                "optionA",
                "optionB",
                "optionC",
                "optionD",
                "correctAnswer"
        );

        for (String field : requiredFields) {

            if (!questionNode.has(field)
                    || questionNode.get(field).asText().isBlank()) {

                throw new BadRequestException(
                        "Invalid AI question format"
                );
            }
        }

        String correctAnswer =
                questionNode.get("correctAnswer")
                        .asText()
                        .trim();

        List<String> validCorrectAnswers = List.of(
                "Option A",
                "Option B",
                "Option C",
                "Option D"
        );

        if (!validCorrectAnswers.contains(correctAnswer)) {

            throw new BadRequestException(
                    "Correct answer must be Option A/B/C/D"
            );
        }
    }
}
