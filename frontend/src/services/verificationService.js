/**
 * verificationService.js
 * ──────────────────────
 * Service layer for AI Skill Verification API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract:
 *   POST /api/v1/tests/generate   → GenerateTestResponse
 *   POST /api/v1/tests/submit     → SubmitTestResponse
 *   GET  /api/v1/tests/:testId    → TestResultResponse
 *
 * Always returns response.data.data (inner payload from ApiResponse<T>).
 */

import api from './api';

/**
 * Generate a new AI MCQ test for a given user skill.
 * @param {{ userSkillId: number }} payload
 * @returns {Promise<{ testId, skillName, skillLevel, questions: Question[] }>}
 */
export const generateTest = async (payload) => {
  const response = await api.post('/tests/generate', payload);
  return response.data.data;
};

/**
 * Submit answers for a test.
 * @param {{ testId: number, answers: { questionId: number, selectedAnswer: string }[] }} payload
 * @returns {Promise<{ testId, passed, score, totalQuestions, correctAnswers }>}
 */
export const submitTest = async (payload) => {
  const response = await api.post('/tests/submit', payload);
  return response.data.data;
};

/**
 * Fetch the result of a completed test.
 * @param {number} testId
 * @returns {Promise<TestResult>}
 */
export const getTestResult = async (testId) => {
  const response = await api.get(`/tests/result/${testId}`);
  return response.data.data;
};

/**
 * Fetch the user's verified skills badges.
 * @returns {Promise<{ skillId, skillName, verificationScore, verifiedAt }[]>}
 */
export const getVerifiedBadges = async () => {
  const response = await api.get('/users/skills/verified-badges');
  return response.data.data;
};
