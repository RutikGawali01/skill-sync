/**
 * profileSlice.js
 * ───────────────
 * Redux slice for the Profile feature.
 *
 * State shape:
 * {
 *   profile   : UserProfileResponseDTO | null,
 *   loading   : boolean,
 *   updating  : boolean,
 *   error     : string | null,
 *   isEditing : boolean,
 * }
 *
 * Async thunks:
 *   fetchMyProfile()   — GET /api/users
 *   updateProfile(dto) — PUT /api/users  (JSON body)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyProfile, updateProfile as updateProfileApi } from '../services/profileService';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyProfile();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load profile'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      return await updateProfileApi(data);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    updating: false,
    error: null,
    isEditing: false,
  },
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
      state.error = null;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchMyProfile ──────────────────────────────────────────────────────
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateProfile ───────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.isEditing = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { setEditing, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectProfile = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileUpdating = (state) => state.profile.updating;
export const selectProfileError = (state) => state.profile.error;
export const selectIsEditing = (state) => state.profile.isEditing;
