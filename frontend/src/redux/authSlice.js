import { createSlice } from '@reduxjs/toolkit';
import { tokenService } from '../utils/tokenUtils';

/**
 * authSlice — stores user identity and the current accessToken in Redux.
 *
 * IMPORTANT: Reducers are pure — NO localStorage side-effects here.
 * Token persistence (read/write to localStorage) is done by:
 *   - tokenService.set()  → called by components after login / SilentRefresh
 *   - tokenService.clear() → called by the Axios 401 interceptor or logout handler
 */
const authSlice = createSlice({
  name: 'auth',
  // Seed token from storage so Redux state matches localStorage on first render
  initialState: {
    user: null,
    token: tokenService.get() || null,
  },
  reducers: {
    /** Called after successful login/register/silent-refresh — purely sets Redux state */
    setAuth: (state, action) => {
      state.user  = action.payload.user;
      state.token = action.payload.token;
    },
    /** Called on explicit logout — purely clears Redux state */
    logout: (state) => {
      state.user  = null;
      state.token = null;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
