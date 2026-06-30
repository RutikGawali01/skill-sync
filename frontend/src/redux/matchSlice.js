/**
 * matchSlice.js
 * ─────────────
 * Redux slice for the Matching Engine feature.
 *
 * State shape:
 * {
 *   recommendedMatches : RecommendationDTO[],     // ranked recommendations from backend
 *   mutualMatches      : MatchResponseDTO[],       // mutual exchange matches
 *   selectedMatch      : RecommendationDTO | MatchResponseDTO | null,
 *   recommendedLoading : boolean,
 *   mutualLoading      : boolean,
 *   recommendedError   : string | null,
 *   mutualError        : string | null,
 *   pagination         : { page: number, size: number, totalPages: number, totalElements: number },
 * }
 *
 * Async thunks:
 *   fetchRecommendations({ page?, size? })
 *   fetchMutualMatches()
 *
 * IMPORTANT: Do NOT frontend-rank results — backend already returns them ranked.
 * IMPORTANT: No userId anywhere — backend derives user from JWT.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRecommendations, getMutualMatches } from '../services/matchService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * Fetch paginated ranked recommendations.
 * Backend Page<RecommendationDTO> shape:
 *   { content, totalPages, totalElements, number (current page) }
 */
export const fetchRecommendations = createAsyncThunk(
  'matches/fetchRecommendations',
  async ({ page = 0, size = 9 } = {}, { rejectWithValue }) => {
    try {
      return await getRecommendations({ page, size });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load recommendations'
      );
    }
  }
);

/**
 * Fetch paginated mutual exchange matches.
 */
export const fetchMutualMatches = createAsyncThunk(
  'matches/fetchMutualMatches',
  async (params, { rejectWithValue }) => {
    try {
      return await getMutualMatches(params);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load mutual matches'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const matchSlice = createSlice({
  name: 'matches',
  initialState: {
    recommendedMatches : [],
    mutualMatches      : [],
    selectedMatch      : null,
    recommendedLoading : false,
    mutualLoading      : false,
    recommendedError   : null,
    mutualError        : null,
    pagination         : {
      page         : 0,
      size         : 9,
      totalPages   : 0,
      totalElements: 0,
    },
    mutualPagination   : {
      page         : 0,
      size         : 10,
      totalPages   : 0,
      totalElements: 0,
    },
  },
  reducers: {
    /** Open match details drawer. */
    setSelectedMatch: (state, action) => {
      state.selectedMatch = action.payload;
    },
    /** Close match details drawer. */
    clearSelectedMatch: (state) => {
      state.selectedMatch = null;
    },
    /** Reset error states (e.g. on tab switch). */
    clearMatchErrors: (state) => {
      state.recommendedError = null;
      state.mutualError      = null;
    },
    /** Change page for recommendations pagination. */
    setRecommendationPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    /** Change page for mutual matches pagination. */
    setMutualPage: (state, action) => {
      state.mutualPagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchRecommendations ─────────────────────────────────────────────────
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.recommendedLoading = true;
        state.recommendedError   = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendedLoading = false;
        const page = action.payload;
        // Backend returns Spring Page<T> shape
        state.recommendedMatches      = Array.isArray(page?.content) ? page.content : [];
        state.pagination.totalPages   = page?.totalPages   ?? 0;
        state.pagination.totalElements= page?.totalElements ?? 0;
        state.pagination.page         = page?.number       ?? 0;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.recommendedLoading = false;
        state.recommendedError   = action.payload;
      });

    // ── fetchMutualMatches ───────────────────────────────────────────────────
    builder
      .addCase(fetchMutualMatches.pending, (state) => {
        state.mutualLoading = true;
        state.mutualError   = null;
      })
      .addCase(fetchMutualMatches.fulfilled, (state, action) => {
        state.mutualLoading = false;
        const page = action.payload;
        state.mutualMatches = Array.isArray(page?.content) ? page.content : [];
        state.mutualPagination = {
          page: page?.page ?? 0,
          size: page?.size ?? 10,
          totalPages: page?.totalPages ?? 0,
          totalElements: page?.totalElements ?? 0,
        };
      })
      .addCase(fetchMutualMatches.rejected, (state, action) => {
        state.mutualLoading = false;
        state.mutualError   = action.payload;
      });
  },
});

export const {
  setSelectedMatch,
  clearSelectedMatch,
  clearMatchErrors,
  setRecommendationPage,
  setMutualPage,
} = matchSlice.actions;

export default matchSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectRecommendedMatches  = (state) => state.matches.recommendedMatches;
export const selectMutualMatches       = (state) => state.matches.mutualMatches;
export const selectSelectedMatch       = (state) => state.matches.selectedMatch;
export const selectRecommendedLoading  = (state) => state.matches.recommendedLoading;
export const selectMutualLoading       = (state) => state.matches.mutualLoading;
export const selectRecommendedError    = (state) => state.matches.recommendedError;
export const selectMutualError         = (state) => state.matches.mutualError;
export const selectMatchPagination     = (state) => state.matches.pagination;
export const selectMutualPagination     = (state) => state.matches.mutualPagination;
