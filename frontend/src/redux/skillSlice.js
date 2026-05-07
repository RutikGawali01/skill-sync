/**
 * skillSlice.js
 * ─────────────
 * Redux slice for the Skills feature (catalog + user skills).
 *
 * State shape:
 * {
 *   availableSkills : SkillDTO[],          // master catalog from GET /api/skills
 *   userSkills      : UserSkillDTO[],      // current user's skills
 *   loading         : boolean,             // userSkills fetch
 *   catalogLoading  : boolean,             // availableSkills fetch
 *   adding          : boolean,             // add skill in progress
 *   removing        : number | null,       // skillId currently being removed
 *   error           : string | null,
 *   selectedType    : 'ALL'|'OFFER'|'WANT',
 * }
 *
 * Async thunks:
 *   fetchAvailableSkills(keyword?)
 *   fetchUserSkills()
 *   addUserSkill({ skillId, type, level })
 *   removeUserSkill({ skillId, type })
 *
 * IMPORTANT: No userId anywhere — backend derives user from JWT.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllSkills,
  getUserSkills,
  addSkill,
  removeSkill,
} from '../services/skillService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** Fetch master skill catalog, optionally filtered by keyword. */
export const fetchAvailableSkills = createAsyncThunk(
  'skills/fetchAvailableSkills',
  async (keyword, { rejectWithValue }) => {
    try {
      return await getAllSkills(keyword);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load skill catalog'
      );
    }
  }
);

/** Fetch the current user's skills (JWT-identified). */
export const fetchUserSkills = createAsyncThunk(
  'skills/fetchUserSkills',
  async (_, { rejectWithValue }) => {
    try {
      return await getUserSkills();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load skills'
      );
    }
  }
);

/**
 * Add a skill to the current user's profile.
 * Payload: { skillId, type, level }
 */
export const addUserSkill = createAsyncThunk(
  'skills/addUserSkill',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const result = await addSkill(payload);
      // Re-fetch for server-authoritative list
      dispatch(fetchUserSkills());
      return result;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to add skill'
      );
    }
  }
);

/**
 * Remove a skill from the current user's profile.
 * Payload: { skillId, type }
 */
export const removeUserSkill = createAsyncThunk(
  'skills/removeUserSkill',
  async ({ skillId, type }, { rejectWithValue, dispatch }) => {
    try {
      await removeSkill(skillId, type);
      dispatch(fetchUserSkills());
      return skillId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to remove skill'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const skillSlice = createSlice({
  name: 'skills',
  initialState: {
    availableSkills: [],       // master catalog
    userSkills:      [],       // current user's skills
    loading:         false,    // user skills fetch
    catalogLoading:  false,    // catalog fetch
    adding:          false,
    removing:        null,     // skillId being removed (per-card spinner)
    error:           null,
    selectedType:    'ALL',
  },
  reducers: {
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },
    clearSkillError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAvailableSkills ─────────────────────────────────────────────────
    builder
      .addCase(fetchAvailableSkills.pending, (state) => {
        state.catalogLoading = true;
        state.error          = null;
      })
      .addCase(fetchAvailableSkills.fulfilled, (state, action) => {
        state.catalogLoading  = false;
        state.availableSkills = action.payload ?? [];
      })
      .addCase(fetchAvailableSkills.rejected, (state, action) => {
        state.catalogLoading = false;
        state.error          = action.payload;
      });

    // ── fetchUserSkills ──────────────────────────────────────────────────────
    builder
      .addCase(fetchUserSkills.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchUserSkills.fulfilled, (state, action) => {
        state.loading    = false;
        state.userSkills = action.payload ?? [];
      })
      .addCase(fetchUserSkills.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── addUserSkill ─────────────────────────────────────────────────────────
    builder
      .addCase(addUserSkill.pending, (state) => {
        state.adding = true;
        state.error  = null;
      })
      .addCase(addUserSkill.fulfilled, (state) => {
        state.adding = false;
        // list refreshed via fetchUserSkills dispatch
      })
      .addCase(addUserSkill.rejected, (state, action) => {
        state.adding = false;
        state.error  = action.payload;
      });

    // ── removeUserSkill ──────────────────────────────────────────────────────
    builder
      .addCase(removeUserSkill.pending, (state, action) => {
        state.removing = action.meta.arg.skillId;
        state.error    = null;
      })
      .addCase(removeUserSkill.fulfilled, (state) => {
        state.removing = null;
        // list refreshed via fetchUserSkills dispatch
      })
      .addCase(removeUserSkill.rejected, (state, action) => {
        state.removing = null;
        state.error    = action.payload;
      });
  },
});

export const { setSelectedType, clearSkillError } = skillSlice.actions;
export default skillSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAvailableSkills  = (state) => state.skills.availableSkills;
export const selectUserSkills       = (state) => state.skills.userSkills;
export const selectSkillsLoading    = (state) => state.skills.loading;
export const selectCatalogLoading   = (state) => state.skills.catalogLoading;
export const selectSkillsAdding     = (state) => state.skills.adding;
export const selectSkillsRemoving   = (state) => state.skills.removing;
export const selectSkillsError      = (state) => state.skills.error;
export const selectSelectedType     = (state) => state.skills.selectedType;
