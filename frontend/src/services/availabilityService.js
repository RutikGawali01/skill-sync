/**
 * availabilityService.js
 * ──────────────────────
 * Service layer for Availability API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend):
 *   GET    /api/availability/user/{userId}                       → ApiResponse<List<AvailabilityDTO>>
 *   POST   /api/availability/user/{userId}                       → ApiResponse<AvailabilityDTO>
 *   PUT    /api/availability/user/{userId}/{availabilityId}      → ApiResponse<AvailabilityDTO>
 *   DELETE /api/availability/user/{userId}/{availabilityId}      → ApiResponse<Void>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 */

import api from './api';

const BASE = '/availability';

// ── Fetch all availability slots for a user ───────────────────────────────────

/**
 * Get all weekly availability slots for the given user.
 * @param {number|string} userId
 * @returns {Promise<AvailabilityDTO[]>}
 */
export const getUserAvailability = async (userId) => {
  const response = await api.get(`${BASE}/user/${userId}`);
  return response.data.data;
};

// ── Add a new availability slot ───────────────────────────────────────────────

/**
 * Create a new weekly availability slot.
 * @param {number|string} userId
 * @param {{ day: string, startTime: string, endTime: string }} payload
 * @returns {Promise<AvailabilityDTO>}
 */
export const addAvailability = async (userId, payload) => {
  const response = await api.post(`${BASE}/user/${userId}`, payload);
  return response.data.data;
};

// ── Update an existing availability slot ──────────────────────────────────────

/**
 * Update an existing availability slot.
 * @param {number|string} userId
 * @param {number|string} availabilityId
 * @param {{ day: string, startTime: string, endTime: string }} payload
 * @returns {Promise<AvailabilityDTO>}
 */
export const updateAvailability = async (userId, availabilityId, payload) => {
  const response = await api.put(
    `${BASE}/user/${userId}/${availabilityId}`,
    payload,
  );
  return response.data.data;
};

// ── Delete an availability slot ───────────────────────────────────────────────

/**
 * Remove an availability slot.
 * @param {number|string} userId
 * @param {number|string} availabilityId
 * @returns {Promise<void>}
 */
export const deleteAvailability = async (userId, availabilityId) => {
  const response = await api.delete(
    `${BASE}/user/${userId}/${availabilityId}`,
  );
  return response.data.data;
};
