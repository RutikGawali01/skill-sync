/**
 * sessionThunk.js
 * ───────────────
 * Async thunks for Session feature — separated from the slice for clean architecture.
 *
 * Each thunk:
 *   - Calls the sessionService layer (never axios directly)
 *   - Returns the payload on success
 *   - Returns rejectWithValue with a human-readable message on failure
 *
 * IMPORTANT: No userId anywhere — backend derives user from JWT.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as sessionService from '../../services/sessionService';

// ── Create a new session request ──────────────────────────────────────────────

export const createSessionRequest = createAsyncThunk(
  'sessions/createSession',
  async (payload, { rejectWithValue }) => {
    try {
      return await sessionService.createSession(payload);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create session request'
      );
    }
  }
);

// ── Fetch current user's sessions ─────────────────────────────────────────────

export const fetchMySessions = createAsyncThunk(
  'sessions/fetchMySessions',
  async (_, { rejectWithValue }) => {
    try {
      return await sessionService.getMySessions();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load sessions'
      );
    }
  }
);

// ── Update session status (accept / reject) ───────────────────────────────────

export const updateSessionStatusThunk = createAsyncThunk(
  'sessions/updateSessionStatus',
  async ({ sessionId, status }, { rejectWithValue }) => {
    try {
      return await sessionService.updateSessionStatus(sessionId, status);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update session status'
      );
    }
  }
);

// ── Cancel a session ──────────────────────────────────────────────────────────

export const cancelSessionThunk = createAsyncThunk(
  'sessions/cancelSession',
  async ({ sessionId, reason }, { rejectWithValue }) => {
    try {
      return await sessionService.cancelSession(sessionId, reason);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to cancel session'
      );
    }
  }
);

// ── Complete a session ────────────────────────────────────────────────────────

export const completeSessionThunk = createAsyncThunk(
  'sessions/completeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.completeSession(sessionId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to complete session'
      );
    }
  }
);

// ── Fetch single session details ──────────────────────────────────────────────

export const fetchSessionDetails = createAsyncThunk(
  'sessions/fetchSessionDetails',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.getSessionDetails(sessionId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load session details'
      );
    }
  }
);
