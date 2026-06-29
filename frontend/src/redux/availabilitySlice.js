/**
 * availabilitySlice.js
 * ────────────────────
 * Redux slice for the Weekly Availability feature.
 *
 * State shape:
 * {
 *   slots       : AvailabilityDTO[],  // all user availability slots
 *   loading     : boolean,            // initial fetch
 *   creating    : boolean,            // add slot in progress
 *   updatingId  : number | null,      // availabilityId being updated
 *   deletingId  : number | null,      // availabilityId being deleted
 *   error       : string | null,
 * }
 *
 * Async thunks:
 *   fetchAvailability(userId)
 *   createAvailability({ userId, payload })
 *   editAvailability({ userId, availabilityId, payload })
 *   removeAvailability({ userId, availabilityId })
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
} from '../services/availabilityService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** Fetch all weekly availability slots for a user. */
export const fetchAvailability = createAsyncThunk(
  'availability/fetchAvailability',
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserAvailability(userId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load availability',
      );
    }
  },
);

/** Add a new availability slot. Re-fetches for server-authoritative list. */
export const createAvailability = createAsyncThunk(
  'availability/createAvailability',
  async ({ userId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const result = await addAvailability(userId, payload);
      // Re-fetch for server-authoritative list
      dispatch(fetchAvailability(userId));
      return result;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to add availability slot',
      );
    }
  },
);

/** Update an existing availability slot. */
export const editAvailability = createAsyncThunk(
  'availability/editAvailability',
  async ({ userId, availabilityId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const result = await updateAvailability(userId, availabilityId, payload);
      dispatch(fetchAvailability(userId));
      return result;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update availability slot',
      );
    }
  },
);

/** Delete an availability slot. */
export const removeAvailability = createAsyncThunk(
  'availability/removeAvailability',
  async ({ userId, availabilityId }, { rejectWithValue, dispatch }) => {
    try {
      await deleteAvailability(userId, availabilityId);
      dispatch(fetchAvailability(userId));
      return availabilityId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete availability slot',
      );
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    slots:      [],
    loading:    false,
    loaded:     false,
    creating:   false,
    updatingId: null,    // id being updated (per-slot spinner)
    deletingId: null,    // id being deleted (per-slot spinner)
    error:      null,
  },
  reducers: {
    clearAvailabilityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAvailability ───────────────────────────────────────────────────
    builder
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded  = true;
        state.slots   = action.payload ?? [];
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.loaded  = true;
        state.error   = action.payload;
      });

    // ── createAvailability ──────────────────────────────────────────────────
    builder
      .addCase(createAvailability.pending, (state) => {
        state.creating = true;
        state.error    = null;
      })
      .addCase(createAvailability.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createAvailability.rejected, (state, action) => {
        state.creating = false;
        state.error    = action.payload;
      });

    // ── editAvailability ────────────────────────────────────────────────────
    builder
      .addCase(editAvailability.pending, (state, action) => {
        state.updatingId = action.meta.arg.availabilityId;
        state.error      = null;
      })
      .addCase(editAvailability.fulfilled, (state) => {
        state.updatingId = null;
      })
      .addCase(editAvailability.rejected, (state, action) => {
        state.updatingId = null;
        state.error      = action.payload;
      });

    // ── removeAvailability ──────────────────────────────────────────────────
    builder
      .addCase(removeAvailability.pending, (state, action) => {
        state.deletingId = action.meta.arg.availabilityId;
        state.error      = null;
      })
      .addCase(removeAvailability.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(removeAvailability.rejected, (state, action) => {
        state.deletingId = null;
        state.error      = action.payload;
      });
  },
});

export const { clearAvailabilityError } = availabilitySlice.actions;
export default availabilitySlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAvailabilitySlots    = (state) => state.availability.slots;
export const selectAvailabilityLoading  = (state) => state.availability.loading;
export const selectAvailabilityLoaded   = (state) => state.availability.loaded;
export const selectAvailabilityCreating = (state) => state.availability.creating;
export const selectAvailabilityUpdating = (state) => state.availability.updatingId;
export const selectAvailabilityDeleting = (state) => state.availability.deletingId;
export const selectAvailabilityError    = (state) => state.availability.error;
