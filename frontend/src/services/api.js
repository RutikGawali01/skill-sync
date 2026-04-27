import axios from 'axios';
import { tokenService } from '../utils/tokenUtils';

const api = axios.create({
  baseURL: '/api',          // Vite proxy forwards to http://localhost:8080/api
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,    // Required: sends HttpOnly refreshToken cookie on every request
});

// ── Request interceptor: attach accessToken ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenService.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── 401 refresh queue ──────────────────────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests fail at once.
let isRefreshing = false;
let failedQueue  = [];   // [{ resolve, reject }, ...]

const processQueue = (error, newToken = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken)
  );
  failedQueue = [];
};

// ── Response interceptor: handle 401 with silent refresh ──────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status          = error?.response?.status;

    /**
     * Only attempt a token refresh when ALL of these are true:
     *  1. The response is 401 Unauthorized
     *  2. We haven't already retried this exact request
     *  3. The failing request is NOT /auth/refresh itself
     *     (SilentRefresh and explicit refresh calls handle their own errors)
     *  4. The user actually has a token stored — if they are a guest with no
     *     token there is nothing to refresh, so we skip straight to reject.
     */
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const hasToken          = Boolean(tokenService.get());

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      hasToken          // ← only attempt refresh when user was authenticated
    ) {
      if (isRefreshing) {
        // Another refresh is already in-flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh — backend reads HttpOnly cookie, returns new accessToken
        const res = await api.post('/auth/refresh');
        const { accessToken } = res.data.data;

        // Persist and update defaults for all future requests
        tokenService.set(accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);    // retry the original failed request
      } catch (refreshError) {
        // Refresh failed (expired cookie) → force logout
        processQueue(refreshError, null);
        tokenService.clear();

        // Only hard-redirect if NOT already on an auth page
        const onAuthPage =
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register');
        if (!onAuthPage) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
