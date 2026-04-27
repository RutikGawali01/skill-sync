import api from './api';

/** POST /auth/login → { email, password } */
export const login = (data) => api.post('/auth/login', data);

/** POST /auth/register → { name, email, password, bio } */
export const register = (data) => api.post('/auth/register', data);

/**
 * POST /auth/google → { idToken }
 * Sends the Google ID token received from GIS SDK to the backend.
 * Backend verifies it with Google, creates/finds the user, returns accessToken.
 * refreshToken is set as HttpOnly cookie automatically by backend.
 */
export const googleAuth = (idToken) => api.post('/auth/google', { idToken });

/**
 * POST /auth/refresh
 * No body needed — backend reads the HttpOnly refreshToken cookie.
 * Returns a new accessToken.
 * withCredentials: true in the axios instance ensures the cookie is sent.
 */
export const refreshAccessToken = () => api.post('/auth/refresh');
