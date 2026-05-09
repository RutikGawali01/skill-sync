package com.rutik.skill_sync_backend.test.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TestEvaluationUtil {

    private TestEvaluationUtil() {
    }

    /**
     * Calculates percentage score
     *
     * Example:
     * correctAnswers = 7
     * totalQuestions = 10
     *
     * percentage = 70%
     */
    public static double calculatePercentage(
            int correctAnswers,
            int totalQuestions
    ) {

        validateTotalQuestions(totalQuestions);
        validateCorrectAnswers(correctAnswers, totalQuestions);

        double percentage =
                ((double) correctAnswers / totalQuestions) * 100;

        log.info(
                "Calculated percentage: {} for correctAnswers: {} and totalQuestions: {}",
                percentage,
                correctAnswers,
                totalQuestions
        );

        return roundToTwoDecimalPlaces(percentage);
    }

    /**
     * Determines whether test is passed
     */
    public static boolean isPassed(
            double scorePercentage,
            double passingPercentage
    ) {

        boolean passed = scorePercentage >= passingPercentage;

        log.info(
                "Pass evaluation result: {} for score: {} and passingPercentage: {}",
                passed,
                scorePercentage,
                passingPercentage
        );

        return passed;
    }

    /**
     * Returns unanswered question count
     */
    public static int calculateUnansweredQuestions(
            int totalQuestions,
            int attemptedQuestions
    ) {

        if (attemptedQuestions > totalQuestions) {
            throw new IllegalArgumentException(
                    "Attempted questions cannot exceed total questions"
            );
        }

        return totalQuestions - attemptedQuestions;
    }

    /**
     * Returns attempted percentage
     */
    public static double calculateAttemptPercentage(
            int attemptedQuestions,
            int totalQuestions
    ) {

        validateTotalQuestions(totalQuestions);

        return roundToTwoDecimalPlaces(
                ((double) attemptedQuestions / totalQuestions) * 100
        );
    }

    /**
     * Validates total questions
     */
    private static void validateTotalQuestions(int totalQuestions) {

        if (totalQuestions <= 0) {
            throw new IllegalArgumentException(
                    "Total questions must be greater than zero"
            );
        }
    }

    /**
     * Validates correct answers
     */
    private static void validateCorrectAnswers(
            int correctAnswers,
            int totalQuestions
    ) {

        if (correctAnswers < 0) {
            throw new IllegalArgumentException(
                    "Correct answers cannot be negative"
            );
        }

        if (correctAnswers > totalQuestions) {
            throw new IllegalArgumentException(
                    "Correct answers cannot exceed total questions"
            );
        }
    }

    /**
     * Rounds decimal value to 2 places
     */
    private static double roundToTwoDecimalPlaces(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}
