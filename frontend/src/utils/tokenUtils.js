let inMemoryToken = null;

/**
 * tokenService — central abstraction for access token storage.
 * Migrated to secure in-memory variable to protect against XSS.
 */
export const tokenService = {
  get:   ()      => inMemoryToken,
  set:   (token) => { inMemoryToken = token; },
  clear: ()      => { inMemoryToken = null; },
};

// Named aliases for backward compatibility
export const getToken    = tokenService.get;
export const setToken    = tokenService.set;
export const removeToken = tokenService.clear;
export const clearToken  = tokenService.clear;

/**
 * Decode a JWT payload without a library.
 * Backend puts these claims in the token:
 *   { sub: userId, email, role, tokenVersion, iat, exp }
 *
 * Safe client-side — only used for display/UX, never for authorization.
 */
export const decodeToken = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    return {
      id:           decoded.sub,
      email:        decoded.email,
      role:         decoded.role,
      tokenVersion: decoded.tokenVersion,
    };
  } catch {
    return null;
  }
};
