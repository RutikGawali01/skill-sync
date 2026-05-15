/**
 * sessionSlice.js
 * ───────────────
 * Redux slice for Session feature.
 *
 * State shape:
 * {
 *   sessions       : SessionDTO[],       // current user's sessions
 *   selectedSession: SessionDTO | null,   // single session detail view
 *   loading        : boolean,             // sessions list fetch
 *   detailLoading  : boolean,             // single session fetch
 *   creating       : boolean,             // create session in progress
 *   actionLoading  : number | null,       // sessionId currently being acted upon
 *   error          : string | null,       // list-level error
 *   actionError    : string | null,       // action-level error (accept/reject/cancel)
 *   activeTab      : string,             // current dashboard tab
 * }
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  createSessionRequest,
  fetchMySessions,
  updateSessionStatusThunk,
  cancelSessionThunk,
  completeSessionThunk,
  fetchSessionDetails,
} from './sessionThunk';

// ── Session Status Constants ──────────────────────────────────────────────────
export const SESSION_STATUS = {
  PENDING:   'PENDING',
  ACCEPTED:  'ACCEPTED',
  REJECTED:  'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED:   'EXPIRED',
};

// ── Dashboard Tab Constants ───────────────────────────────────────────────────
export const SESSION_TABS = {
  PENDING:   'PENDING',
  UPCOMING:  'UPCOMING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    sessions:        [],
    selectedSession: null,
    loading:         false,
    detailLoading:   false,
    creating:        false,
    actionLoading:   null,     // sessionId being processed
    error:           null,
    actionError:     null,
    activeTab:       SESSION_TABS.PENDING,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearSessionError: (state) => {
      state.error       = null;
      state.actionError = null;
    },
    clearSelectedSession: (state) => {
      state.selectedSession = null;
    },
  },
  extraReducers: (builder) => {
    // ── createSessionRequest ────────────────────────────────────────────────
    builder
      .addCase(createSessionRequest.pending, (state) => {
        state.creating    = true;
        state.actionError = null;
      })
      .addCase(createSessionRequest.fulfilled, (state, action) => {
        state.creating = false;
        // Prepend the new session to the list for instant UI feedback
        if (action.payload) {
          state.sessions = [action.payload, ...state.sessions];
        }
      })
      .addCase(createSessionRequest.rejected, (state, action) => {
        state.creating    = false;
        state.actionError = action.payload;
      });

    // ── fetchMySessions ─────────────────────────────────────────────────────
    builder
      .addCase(fetchMySessions.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMySessions.fulfilled, (state, action) => {
        state.loading  = false;
        // Guard: API may return a wrapper object instead of a plain array
        const data = action.payload;
        state.sessions = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
      })
      .addCase(fetchMySessions.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── updateSessionStatus (accept / reject) ───────────────────────────────
    builder
      .addCase(updateSessionStatusThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg.sessionId;
        state.actionError   = null;
      })
      .addCase(updateSessionStatusThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Optimistic update: replace the session in the list
        if (action.payload) {
          state.sessions = state.sessions.map((s) =>
            s.id === action.payload.id ? action.payload : s
          );
          if (state.selectedSession?.id === action.payload.id) {
            state.selectedSession = action.payload;
          }
        }
      })
      .addCase(updateSessionStatusThunk.rejected, (state, action) => {
        state.actionLoading = null;
        state.actionError   = action.payload;
      });

    // ── cancelSession ───────────────────────────────────────────────────────
    builder
      .addCase(cancelSessionThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg.sessionId;
        state.actionError   = null;
      })
      .addCase(cancelSessionThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        if (action.payload) {
          state.sessions = state.sessions.map((s) =>
            s.id === action.payload.id ? action.payload : s
          );
          if (state.selectedSession?.id === action.payload.id) {
            state.selectedSession = action.payload;
          }
        }
      })
      .addCase(cancelSessionThunk.rejected, (state, action) => {
        state.actionLoading = null;
        state.actionError   = action.payload;
      });

    // ── completeSession ─────────────────────────────────────────────────────
    builder
      .addCase(completeSessionThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
        state.actionError   = null;
      })
      .addCase(completeSessionThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        if (action.payload) {
          state.sessions = state.sessions.map((s) =>
            s.id === action.payload.id ? action.payload : s
          );
          if (state.selectedSession?.id === action.payload.id) {
            state.selectedSession = action.payload;
          }
        }
      })
      .addCase(completeSessionThunk.rejected, (state, action) => {
        state.actionLoading = null;
        state.actionError   = action.payload;
      });

    // ── fetchSessionDetails ─────────────────────────────────────────────────
    builder
      .addCase(fetchSessionDetails.pending, (state) => {
        state.detailLoading = true;
        state.error         = null;
      })
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.detailLoading   = false;
        state.selectedSession = action.payload;
      })
      .addCase(fetchSessionDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.error         = action.payload;
      });
  },
});

export const { setActiveTab, clearSessionError, clearSelectedSession } = sessionSlice.actions;
export default sessionSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllSessions     = (state) => state.sessions.sessions;
export const selectSelectedSession = (state) => state.sessions.selectedSession;
export const selectSessionsLoading = (state) => state.sessions.loading;
export const selectDetailLoading   = (state) => state.sessions.detailLoading;
export const selectCreating        = (state) => state.sessions.creating;
export const selectActionLoading   = (state) => state.sessions.actionLoading;
export const selectSessionError    = (state) => state.sessions.error;
export const selectActionError     = (state) => state.sessions.actionError;
export const selectActiveTab       = (state) => state.sessions.activeTab;

// ── Derived Selectors ─────────────────────────────────────────────────────────

/** Sessions filtered by dashboard tab. */
export const selectFilteredSessions = (state) => {
  const { activeTab } = state.sessions;
  const sessions = Array.isArray(state.sessions.sessions) ? state.sessions.sessions : [];
  switch (activeTab) {
    case SESSION_TABS.PENDING:
      return sessions.filter((s) => s.status === SESSION_STATUS.PENDING);
    case SESSION_TABS.UPCOMING:
      return sessions.filter((s) => s.status === SESSION_STATUS.ACCEPTED);
    case SESSION_TABS.COMPLETED:
      return sessions.filter((s) => s.status === SESSION_STATUS.COMPLETED);
    case SESSION_TABS.CANCELLED:
      return sessions.filter(
        (s) => s.status === SESSION_STATUS.CANCELLED ||
               s.status === SESSION_STATUS.REJECTED ||
               s.status === SESSION_STATUS.EXPIRED
      );
    default:
      return sessions;
  }
};

/** Count of sessions per status for tab badges. */
export const selectSessionCounts = (state) => {
  const sessions = Array.isArray(state.sessions.sessions) ? state.sessions.sessions : [];
  return {
    pending:   sessions.filter((s) => s.status === SESSION_STATUS.PENDING).length,
    upcoming:  sessions.filter((s) => s.status === SESSION_STATUS.ACCEPTED).length,
    completed: sessions.filter((s) => s.status === SESSION_STATUS.COMPLETED).length,
    cancelled: sessions.filter(
      (s) => s.status === SESSION_STATUS.CANCELLED ||
             s.status === SESSION_STATUS.REJECTED ||
             s.status === SESSION_STATUS.EXPIRED
    ).length,
  };
};
