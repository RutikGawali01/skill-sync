/**
 * trustService.js
 * ───────────────
 * Service layer for Trust Score API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend):
 *   GET /api/trust/user/{userId}  → ApiResponse<TrustScoreDTO>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 */

import api from './api';

// ── Get trust score for a user ────────────────────────────────────────────────

/**
 * Fetch the trust score and stats for a given user.
 * @param {number} userId
 * @returns {Promise<TrustScoreDTO>}
 */
export const getUserTrustScore = async (userId) => {
  const response = await api.get(`/trust/user/${userId}`);
  return response.data.data;
};
