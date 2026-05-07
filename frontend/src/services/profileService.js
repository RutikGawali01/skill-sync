/**
 * profileService.js
 * ─────────────────
 * Service layer for Profile API calls.
 * Uses the shared Axios instance (auth interceptors already wired in).
 *
 * API Contract (from UserController.java):
 *   GET /api/users  → ApiResponse<UserProfileResponseDTO>
 *   PUT /api/users  → ApiResponse<UserProfileResponseDTO>  (@RequestBody JSON)
 *
 * Returns response.data.data (the inner DTO payload from ApiResponse<T>).
 */

import api from './api';

/**
 * Fetch the currently authenticated user's profile.
 * Backend: GET /api/users  (extracts email from JWT via Authentication)
 * @returns {Promise<UserProfileResponseDTO>}
 */
export const getMyProfile = async () => {
  const response = await api.get('/users');
  return response.data.data;
};  

/**
 * Update the authenticated user's profile.
 * Backend: PUT /api/users  (@RequestBody UpdateProfileRequestDTO)
 *
 * Sends JSON — the backend does NOT accept multipart/form-data here.
 * Profile picture upload is a separate endpoint (not yet implemented).
 *
 * @param {Object} data - UpdateProfileRequestDTO fields
 * @returns {Promise<UserProfileResponseDTO>}
 */
export const updateProfile = async (data) => {
  const response = await api.put('/users', data);
  return response.data.data;
};
