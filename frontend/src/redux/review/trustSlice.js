/**
 * trustSlice.js
 * ─────────────
 * Redux slice for Trust Score feature.
 *
 * State shape:
 * {
 *   trustData : TrustScoreDTO | null,
 *   loading   : boolean,
 *   error     : string | null,
 * }
 *
 * TrustScoreDTO expected shape (from backend):
 * {
 *   averageRating     : number,
 *   totalReviews      : number,
 *   completionRate    : number,    // 0-100
 *   trustScore        : number,    // 0-100
 *   completedSessions : number,
 *   cancelledSessions : number,
 * }
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as trustService from '../../services/trustService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchTrustScore = createAsyncThunk(
  'trust/fetchTrustScore',
  async (userId, { rejectWithValue }) => {
    try {
      return await trustService.getUserTrustScore(userId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load trust score'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const trustSlice = createSlice({
  name: 'trust',
  initialState: {
    trustData: null,
    loading:   false,
    error:     null,
  },
  reducers: {
    clearTrustError: (state) => {
      state.error = null;
    },
    clearTrustData: (state) => {
      state.trustData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrustScore.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchTrustScore.fulfilled, (state, action) => {
        state.loading   = false;
        state.trustData = action.payload;
      })
      .addCase(fetchTrustScore.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearTrustError, clearTrustData } = trustSlice.actions;
export default trustSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectTrustData    = (state) => state.trust.trustData;
export const selectTrustLoading = (state) => state.trust.loading;
export const selectTrustError   = (state) => state.trust.error;
