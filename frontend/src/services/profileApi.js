/**
 * profileApi.js
 * ─────────────
 * Service layer for all Profile-related API calls.
 * Uses the shared Axios instance (with auth interceptors already wired in).
 *
 * Endpoints:
 *   GET  /api/users/me          → fetch current user's profile
 *   PUT  /api/users/profile     → update bio + profilePic
 */

import api from './api';

/**
 * Fetch the currently authenticated user's full profile.
 * Returns ApiResponse<ProfileDTO> from the backend.
 */
export const fetchProfileApi = () => api.get('/users/me');

/**
 * Update the user's editable profile fields (bio, profilePic).
 *
 * @param {FormData|Object} payload - bio string + optional file
 *   When uploading a picture, send as multipart/form-data (FormData).
 *   For bio-only updates, a plain JSON object is fine.
 */
export const updateProfileApi = (payload) => {
  const isFormData = payload instanceof FormData;
  return api.put('/users/profile', payload, {
    headers: isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' },
  });
};
