/**
 * reviewSlice.js
 * ──────────────
 * Redux slice for Review feature.
 *
 * State shape:
 * {
 *   userReviews    : ReviewDTO[],          // reviews for a given user
 *   sessionReviews : ReviewDTO[],          // reviews for a given session
 *   loading        : boolean,              // user reviews loading
 *   sessionLoading : boolean,              // session reviews loading
 *   submitting     : boolean,              // create review in-flight
 *   error          : string | null,        // fetch-level error
 *   submitError    : string | null,        // create review error
 *   submitSuccess  : boolean,              // flag for post-submit UI
 * }
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as reviewService from '../../services/reviewService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (payload, { rejectWithValue }) => {
    try {
      return await reviewService.createReview(payload);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to submit review'
      );
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      return await reviewService.getReviewsByUser(userId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load reviews'
      );
    }
  }
);

export const fetchSessionReviews = createAsyncThunk(
  'reviews/fetchSessionReviews',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await reviewService.getReviewsBySession(sessionId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load session reviews'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    userReviews:    [],
    sessionReviews: [],
    loading:        false,
    sessionLoading: false,
    submitting:     false,
    error:          null,
    submitError:    null,
    submitSuccess:  false,
  },
  reducers: {
    clearReviewErrors: (state) => {
      state.error       = null;
      state.submitError = null;
    },
    resetSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearSessionReviews: (state) => {
      state.sessionReviews = [];
    },
  },
  extraReducers: (builder) => {
    // ── submitReview ──────────────────────────────────────────────────────────
    builder
      .addCase(submitReview.pending, (state) => {
        state.submitting    = true;
        state.submitError   = null;
        state.submitSuccess = false;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting    = false;
        state.submitSuccess = true;
        // Append to session reviews list for instant UI feedback
        if (action.payload) {
          state.sessionReviews = [...state.sessionReviews, action.payload];
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting  = false;
        state.submitError = action.payload;
      });

    // ── fetchUserReviews ──────────────────────────────────────────────────────
    builder
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading     = false;
        const data        = action.payload;
        state.userReviews = Array.isArray(data) ? data : [];
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchSessionReviews ───────────────────────────────────────────────────
    builder
      .addCase(fetchSessionReviews.pending, (state) => {
        state.sessionLoading = true;
        state.error          = null;
      })
      .addCase(fetchSessionReviews.fulfilled, (state, action) => {
        state.sessionLoading = false;
        const data           = action.payload;
        state.sessionReviews = Array.isArray(data) ? data : [];
      })
      .addCase(fetchSessionReviews.rejected, (state, action) => {
        state.sessionLoading = false;
        state.error          = action.payload;
      });
  },
});

export const { clearReviewErrors, resetSubmitSuccess, clearSessionReviews } = reviewSlice.actions;
export default reviewSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectUserReviews      = (state) => state.reviews.userReviews;
export const selectSessionReviews   = (state) => state.reviews.sessionReviews;
export const selectReviewsLoading   = (state) => state.reviews.loading;
export const selectSessionRLoading  = (state) => state.reviews.sessionLoading;
export const selectSubmitting       = (state) => state.reviews.submitting;
export const selectReviewError      = (state) => state.reviews.error;
export const selectSubmitError      = (state) => state.reviews.submitError;
export const selectSubmitSuccess    = (state) => state.reviews.submitSuccess;

// ── Derived Selectors (memoized) ──────────────────────────────────────────────

/** Average overall rating from user reviews. */
export const selectAverageRating = (state) => {
  const reviews = state.reviews.userReviews;
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/** Rating distribution: { 5: count, 4: count, ... }. Memoized to prevent new-reference rerenders. */
export const selectRatingDistribution = createSelector(
  (state) => state.reviews.userReviews,
  (reviews) => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.round(r.overallRating || 0);
      if (rating >= 1 && rating <= 5) {
        dist[rating] += 1;
      }
    });
    return dist;
  }
);
