/**
 * verificationSlice.js
 * ────────────────────
 * Redux slice for AI-powered Skill Verification tests.
 *
 * State shape:
 * {
 *   currentTest    : { testId, skillName, skillLevel, questions } | null,
 *   answers        : { [questionId]: string },   // selectedAnswer per question
 *   currentIndex   : number,                     // active question index
 *   timerSeconds   : number,                     // remaining seconds
 *   generating     : boolean,
 *   submitting     : boolean,
 *   result         : TestResult | null,
 *   resultLoading  : boolean,
 *   error          : string | null,
 * }
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  generateTest as apiGenerateTest,
  submitTest   as apiSubmitTest,
  getTestResult as apiGetTestResult,
  getVerifiedBadges as apiGetVerifiedBadges,
} from '../services/verificationService';

const TEST_DURATION_SECONDS = 15 * 60; // 15 minutes

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** Generate a new MCQ test for a user skill. */
export const generateTest = createAsyncThunk(
  'verification/generateTest',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiGenerateTest(payload);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to generate test'
      );
    }
  }
);

/** Submit test answers. */
export const submitTest = createAsyncThunk(
  'verification/submitTest',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiSubmitTest(payload);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to submit test'
      );
    }
  }
);

/** Fetch result of an existing test. */
export const fetchTestResult = createAsyncThunk(
  'verification/fetchTestResult',
  async (testId, { rejectWithValue }) => {
    try {
      return await apiGetTestResult(testId);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load test result'
      );
    }
  }
);

/** Fetch verified badges for the profile. */
export const fetchVerifiedBadges = createAsyncThunk(
  'verification/fetchVerifiedBadges',
  async (_, { rejectWithValue }) => {
    try {
      return await apiGetVerifiedBadges();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch verified badges'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const verificationSlice = createSlice({
  name: 'verification',
  initialState: {
    currentTest:   null,
    answers:       {},       // { [questionId]: selectedAnswer }
    currentIndex:  0,
    timerSeconds:  TEST_DURATION_SECONDS,
    generating:    false,
    submitting:    false,
    result:        null,
    resultLoading: false,
    error:         null,
    badges:        [],
    badgesLoading: false,
  },
  reducers: {
    /** Save user's selected answer for a question */
    saveAnswer: (state, action) => {
      const { questionId, selectedAnswer } = action.payload;
      state.answers[questionId] = selectedAnswer;
    },

    /** Navigate to specific question index */
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },

    /** Go to next question */
    nextQuestion: (state) => {
      const total = state.currentTest?.questions?.length ?? 0;
      if (state.currentIndex < total - 1) {
        state.currentIndex += 1;
      }
    },

    /** Go to previous question */
    previousQuestion: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },

    /** Tick down the timer each second */
    tickTimer: (state) => {
      if (state.timerSeconds > 0) {
        state.timerSeconds -= 1;
      }
    },

    /** Reset timer to full duration */
    resetTimer: (state) => {
      state.timerSeconds = TEST_DURATION_SECONDS;
    },

    /** Clear error */
    clearVerificationError: (state) => {
      state.error = null;
    },

    /** Full reset — called when user leaves test or after submission */
    resetTest: (state) => {
      state.currentTest  = null;
      state.answers      = {};
      state.currentIndex = 0;
      state.timerSeconds = TEST_DURATION_SECONDS;
      state.generating   = false;
      state.submitting   = false;
      state.result       = null;
      state.resultLoading = false;
      state.error        = null;
    },
  },
  extraReducers: (builder) => {
    // ── generateTest ──────────────────────────────────────────────────────────
    builder
      .addCase(generateTest.pending, (state) => {
        state.generating = true;
        state.error      = null;
      })
      .addCase(generateTest.fulfilled, (state, action) => {
        state.generating   = false;
        state.currentTest  = action.payload;
        state.answers      = {};
        state.currentIndex = 0;
        state.timerSeconds = TEST_DURATION_SECONDS;
        state.result       = null;
      })
      .addCase(generateTest.rejected, (state, action) => {
        state.generating = false;
        state.error      = action.payload;
      });

    // ── submitTest ────────────────────────────────────────────────────────────
    builder
      .addCase(submitTest.pending, (state) => {
        state.submitting = true;
        state.error      = null;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.submitting = false;
        state.result     = action.payload;
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.submitting = false;
        state.error      = action.payload;
      });

    // ── fetchTestResult ───────────────────────────────────────────────────────
    builder
      .addCase(fetchTestResult.pending, (state) => {
        state.resultLoading = true;
        state.error         = null;
      })
      .addCase(fetchTestResult.fulfilled, (state, action) => {
        state.resultLoading = false;
        state.result        = action.payload;
      })
      .addCase(fetchTestResult.rejected, (state, action) => {
        state.resultLoading = false;
        state.error         = action.payload;
      });

    // ── fetchVerifiedBadges ───────────────────────────────────────────────────
    builder
      .addCase(fetchVerifiedBadges.pending, (state) => {
        state.badgesLoading = true;
      })
      .addCase(fetchVerifiedBadges.fulfilled, (state, action) => {
        state.badgesLoading = false;
        state.badges        = action.payload;
      })
      .addCase(fetchVerifiedBadges.rejected, (state) => {
        state.badgesLoading = false;
      });
  },
});

export const {
  saveAnswer,
  setCurrentIndex,
  nextQuestion,
  previousQuestion,
  tickTimer,
  resetTimer,
  clearVerificationError,
  resetTest,
} = verificationSlice.actions;

export default verificationSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentTest       = (state) => state.verification.currentTest;
export const selectAnswers           = (state) => state.verification.answers;
export const selectCurrentIndex      = (state) => state.verification.currentIndex;
export const selectTimerSeconds      = (state) => state.verification.timerSeconds;
export const selectGenerating        = (state) => state.verification.generating;
export const selectSubmitting        = (state) => state.verification.submitting;
export const selectVerificationResult = (state) => state.verification.result;
export const selectResultLoading     = (state) => state.verification.resultLoading;
export const selectVerificationError = (state) => state.verification.error;
export const selectVerifiedBadges    = (state) => state.verification.badges;
export const selectBadgesLoading     = (state) => state.verification.badgesLoading;
