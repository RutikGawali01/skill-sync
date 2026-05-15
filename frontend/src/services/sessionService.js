/**
 * sessionService.js
 * ─────────────────
 * Service layer for Session API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend — JWT extracts current user automatically):
 *   POST   /api/sessions                     → ApiResponse<SessionDTO>
 *   PUT    /api/sessions/{id}/status          → ApiResponse<SessionDTO>
 *   POST   /api/sessions/{id}/cancel          → ApiResponse<SessionDTO>
 *   POST   /api/sessions/{id}/complete        → ApiResponse<SessionDTO>
 *   GET    /api/sessions/me                   → ApiResponse<List<SessionDTO>>
 *   GET    /api/sessions/{id}                 → ApiResponse<SessionDTO>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 * NEVER pass userId — backend derives it from the JWT.
 */

import api from './api';

// ── Create a new session request ──────────────────────────────────────────────

/**
 * Create a session booking request.
 * @param {{
 *   providerId: number,
 *   skillId: number,
 *   startTime: string,   // ISO 8601 datetime
 *   endTime: string,     // ISO 8601 datetime
 *   message?: string,
 *   mode: 'DIRECT_LEARNING' | 'SKILL_EXCHANGE'
 * }} payload
 * @returns {Promise<SessionDTO>}
 */
export const createSession = async (payload) => {
  const response = await api.post('/sessions', payload);
  return response.data.data;
};

// ── Update session status (accept / reject) ───────────────────────────────────

/**
 * Accept or reject a session request.
 * @param {number} sessionId
 * @param {'ACCEPTED' | 'REJECTED'} status
 * @returns {Promise<SessionDTO>}
 */
export const updateSessionStatus = async (sessionId, status) => {
  const response = await api.put(`/sessions/${sessionId}/status`, { status });
  return response.data.data;
};

// ── Cancel a session ──────────────────────────────────────────────────────────

/**
 * Cancel an accepted/pending session.
 * Backend requires CancelSessionRequestDto with { reason: string }.
 * @param {number} sessionId
 * @param {string} [reason='Cancelled by user']
 * @returns {Promise<SessionDTO>}
 */
export const cancelSession = async (sessionId, reason = 'Cancelled by user') => {
  const response = await api.post(`/sessions/${sessionId}/cancel`, { reason });
  return response.data.data;
};

// ── Complete a session ────────────────────────────────────────────────────────

/**
 * Mark a session as completed.
 * @param {number} sessionId
 * @returns {Promise<SessionDTO>}
 */
export const completeSession = async (sessionId) => {
  const response = await api.post(`/sessions/${sessionId}/complete`);
  return response.data.data;
};

// ── Fetch current user's sessions ─────────────────────────────────────────────

/**
 * Fetch all sessions for the logged-in user (as requester or provider).
 * @returns {Promise<SessionDTO[]>}
 */
export const getMySessions = async () => {
  const response = await api.get('/sessions/me');
  return response.data.data;
};

// ── Fetch single session details ──────────────────────────────────────────────

/**
 * Fetch detailed information for a single session.
 * @param {number} sessionId
 * @returns {Promise<SessionDTO>}
 */
export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data.data;
};
