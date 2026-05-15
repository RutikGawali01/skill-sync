/**
 * reviewService.js
 * ────────────────
 * Service layer for Review API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend):
 *   POST   /api/reviews                      → ApiResponse<ReviewDTO>
 *   GET    /api/reviews/user/{userId}         → ApiResponse<List<ReviewDTO>>
 *   GET    /api/reviews/session/{sessionId}   → ApiResponse<List<ReviewDTO>>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 */

import api from './api';

// ── Create a new review ───────────────────────────────────────────────────────

/**
 * Submit a review for a completed session.
 * @param {{
 *   sessionId: number,
 *   revieweeId: number,
 *   overallRating: number,
 *   teachingRating: number,
 *   communicationRating: number,
 *   punctualityRating: number,
 *   knowledgeRating: number,
 *   feedback: string,
 * }} payload
 * @returns {Promise<ReviewDTO>}
 */
export const createReview = async (payload) => {
  const response = await api.post('/reviews', payload);
  return response.data.data;
};

// ── Fetch reviews for a specific user ─────────────────────────────────────────

/**
 * Get all reviews received by a given user.
 * @param {number} userId
 * @returns {Promise<ReviewDTO[]>}
 */
export const getReviewsByUser = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data.data;
};

// ── Fetch reviews for a specific session ──────────────────────────────────────

/**
 * Get all reviews for a particular session.
 * @param {number} sessionId
 * @returns {Promise<ReviewDTO[]>}
 */
export const getReviewsBySession = async (sessionId) => {
  const response = await api.get(`/reviews/session/${sessionId}`);
  return response.data.data;
};
