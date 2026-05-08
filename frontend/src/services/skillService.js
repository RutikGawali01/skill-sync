/**
 * skillService.js
 * ───────────────
 * Service layer for Skills API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend — JWT extracts current user automatically):
 *   GET    /api/skills                       → ApiResponse<List<SkillDTO>>
 *   GET    /api/users/skills                 → ApiResponse<List<UserSkillDTO>>
 *   GET    /api/users/skills/filter?type=    → ApiResponse<List<UserSkillDTO>>
 *   POST   /api/users/skills                 → ApiResponse<UserSkillDTO>
 *   DELETE /api/users/skills?skillId=&type=  → ApiResponse<Void>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 * NEVER pass userId — backend derives it from the JWT.
 */

import api from './api';

// ── Master Skill Catalog ──────────────────────────────────────────────────────

/**
 * Fetch the master skill catalog (all platform skills).
 * @param {string} [keyword]  Optional search keyword
 * @returns {Promise<SkillDTO[]>}  [{ id, name, category }, ...]
 */
export const getAllSkills = async (keyword) => {
  const params = keyword ? { keyword } : {};
  const response = await api.get('/skills', { params });
  return response.data.data;
};

// ── Current User Skills ───────────────────────────────────────────────────────

/**
 * Fetch the current authenticated user's skills.
 * Backend extracts userId from JWT — no userId param needed.
 * @returns {Promise<UserSkillDTO[]>}
 */
export const getUserSkills = async () => {
  const response = await api.get('/users/skills');
  return response.data.data;
};

/**
 * Add a skill to the current user's profile.
 * @param {{ skillId: number, type: 'OFFER'|'WANT', level: string }} payload
 * @returns {Promise<UserSkillDTO>}
 */
export const addSkill = async (payload) => {
  const response = await api.post('/users/skills', payload);
  return response.data.data;
};

/**
 * Remove a skill from the current user's profile.
 * @param {number}          skillId
 * @param {'OFFER'|'WANT'}  type
 * @returns {Promise<void>}
 */
export const removeSkill = async (skillId, type) => {
  const response = await api.delete('/users/skills', {
    params: { skillId, type },
  });
  return response.data.data;
};

// ── Explore Skills ────────────────────────────────────────────────────────────

/**
 * Fetch the public explore feed — skills offered by all users on the platform.
 * @returns {Promise<ExploreSkillDTO[]>}
 *   [{ userSkillId, skillName, skillLevel, category, userId,
 *      fullName, profilePicture, rating, completedSessions, offersSkill }, ...]
 */
export const getExploreSkills = async () => {
  const response = await api.get('/skills/explore');
  return response.data.data;
};

