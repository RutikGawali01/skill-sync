/**
 * matchService.js
 * ───────────────
 * Service layer for Matching Engine API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend — JWT extracts current user automatically):
 *   GET  /api/matches/recommendations?page=&size=  → ApiResponse<Page<RecommendationDTO>>
 *   GET  /api/matches/mutual                        → ApiResponse<List<MatchResponseDTO>>
 *
 * RecommendationDTO shape:
 *   {
 *     candidate            : { id, name, email, bio, profilePicUrl, location, rating, completedSessions },
 *     matchScore           : { overallScore, percentage, confidence, breakdown: { skillScore, trustScore,
 *                               ratingScore, availabilityScore, experienceScore, activityScore } },
 *     recommendationReason : { reasons: [{ reasonType, message, weightContribution }] }
 *   }
 *
 * MatchResponseDTO shape (mutual):
 *   {
 *     candidate   : { id, name, email, bio, profilePicUrl, location, rating, completedSessions },
 *     matchType   : "MUTUAL",
 *     mutualMatch : { exchangeSkills: [{ skillName, direction: "GIVE"|"TAKE", level }] },
 *     score       : number
 *   }
 *
 * Always returns response.data.data (inner payload from ApiResponse<T>).
 * NEVER pass userId — backend derives it from the JWT.
 */

import api from './api';

// ── Recommendations ───────────────────────────────────────────────────────────

/**
 * Fetch personalised ranked recommendations for the current user.
 * Results are already ranked by the backend engine — display as-is.
 *
 * @param {{ page?: number, size?: number }} [params]
 * @returns {Promise<{ content: RecommendationDTO[], totalPages: number, totalElements: number, number: number }>}
 */
export const getRecommendations = async ({ page = 0, size = 9, search = '', sortBy = 'matchScore', sortDir = 'desc' } = {}) => {
  const response = await api.get('/matches/recommendations', {
    params: { page, size, search, sortBy, sortDir },
  });
  return response.data.data; // PageResponse<RecommendationDTO>
};

// ── Mutual Matches ────────────────────────────────────────────────────────────

/**
 * Fetch all mutual skill-exchange matches for the current user.
 * A mutual match means: current user teaches candidate something AND
 * candidate teaches current user something.
 *
 * @returns {Promise<PageResponse<MatchResponseDTO>>}
 */
export const getMutualMatches = async ({ page = 0, size = 10, search = '', sortBy = 'matchScore', sortDir = 'desc' } = {}) => {
  const response = await api.get('/matches/mutual', {
    params: { page, size, search, sortBy, sortDir },
  });
  return response.data.data; // PageResponse<MatchResponseDTO>
};
