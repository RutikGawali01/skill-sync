/**
 * useSessionActions.js
 * ────────────────────
 * Custom hook: unified interface for all session operations.
 *
 * Provides:
 *   - All session state from Redux (sessions, loading, errors, tabs)
 *   - Action dispatchers with notification feedback
 *   - Tab management
 *   - Role-aware helpers
 *
 * Usage:
 *   const { sessions, loading, requestSession, acceptSession } = useSessionActions();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import {
  createSessionRequest,
  fetchMySessions,
  updateSessionStatusThunk,
  cancelSessionThunk,
  completeSessionThunk,
  fetchSessionDetails,
} from '../redux/session/sessionThunk';
import {
  setActiveTab,
  clearSessionError,
  clearSelectedSession,
  selectAllSessions,
  selectSelectedSession,
  selectSessionsLoading,
  selectDetailLoading,
  selectCreating,
  selectActionLoading,
  selectSessionError,
  selectActionError,
  selectActiveTab,
  selectFilteredSessions,
  selectSessionCounts,
} from '../redux/session/sessionSlice';

const useSessionActions = () => {
  const dispatch = useDispatch();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const sessions        = useSelector(selectAllSessions);
  const filtered        = useSelector(selectFilteredSessions);
  const selected        = useSelector(selectSelectedSession);
  const counts          = useSelector(selectSessionCounts);
  const loading         = useSelector(selectSessionsLoading);
  const detailLoading   = useSelector(selectDetailLoading);
  const creating        = useSelector(selectCreating);
  const actionLoading   = useSelector(selectActionLoading);
  const error           = useSelector(selectSessionError);
  const actionError     = useSelector(selectActionError);
  const activeTab       = useSelector(selectActiveTab);

  // ── Actions ────────────────────────────────────────────────────────────────

  const loadSessions = useCallback(() => {
    dispatch(fetchMySessions());
  }, [dispatch]);

  const loadSessionDetails = useCallback((sessionId) => {
    dispatch(fetchSessionDetails(sessionId));
  }, [dispatch]);

  /**
   * Create a new session booking request.
   * @returns {Promise<boolean>} true on success
   */
  const requestSession = useCallback(async (payload) => {
    const result = await dispatch(createSessionRequest(payload));
    if (createSessionRequest.fulfilled.match(result)) {
      notifications.show({
        title: 'Session Requested',
        message: 'Your session request has been sent successfully!',
        color: 'green',
      });
      return true;
    }
    notifications.show({
      title: 'Request Failed',
      message: result.payload || 'Could not create session request.',
      color: 'red',
    });
    return false;
  }, [dispatch]);

  /**
   * Accept a pending session request.
   */
  const acceptSession = useCallback(async (sessionId) => {
    const result = await dispatch(updateSessionStatusThunk({ sessionId, status: 'ACCEPTED' }));
    if (updateSessionStatusThunk.fulfilled.match(result)) {
      notifications.show({
        title: 'Session Accepted',
        message: 'The session has been accepted. See you there!',
        color: 'green',
      });
      return true;
    }
    notifications.show({
      title: 'Action Failed',
      message: result.payload || 'Could not accept session.',
      color: 'red',
    });
    return false;
  }, [dispatch]);

  /**
   * Reject a pending session request.
   */
  const rejectSession = useCallback(async (sessionId) => {
    const result = await dispatch(updateSessionStatusThunk({ sessionId, status: 'REJECTED' }));
    if (updateSessionStatusThunk.fulfilled.match(result)) {
      notifications.show({
        title: 'Session Rejected',
        message: 'The session request has been rejected.',
        color: 'orange',
      });
      return true;
    }
    notifications.show({
      title: 'Action Failed',
      message: result.payload || 'Could not reject session.',
      color: 'red',
    });
    return false;
  }, [dispatch]);

  /**
   * Cancel an accepted or pending session.
   * @param {number} sessionId
   * @param {string} [reason] — optional cancellation reason
   */
  const cancelSession = useCallback(async (sessionId, reason) => {
    const result = await dispatch(cancelSessionThunk({
      sessionId,
      reason: reason || 'Cancelled by user',
    }));
    if (cancelSessionThunk.fulfilled.match(result)) {
      notifications.show({
        title: 'Session Cancelled',
        message: 'The session has been cancelled.',
        color: 'yellow',
      });
      return true;
    }
    notifications.show({
      title: 'Action Failed',
      message: result.payload || 'Could not cancel session.',
      color: 'red',
    });
    return false;
  }, [dispatch]);

  /**
   * Mark a session as completed.
   */
  const completeSession = useCallback(async (sessionId) => {
    const result = await dispatch(completeSessionThunk(sessionId));
    if (completeSessionThunk.fulfilled.match(result)) {
      notifications.show({
        title: 'Session Completed',
        message: 'Session marked as completed. Great job!',
        color: 'teal',
      });
      return true;
    }
    notifications.show({
      title: 'Action Failed',
      message: result.payload || 'Could not complete session.',
      color: 'red',
    });
    return false;
  }, [dispatch]);

  const changeTab = useCallback((tab) => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearSessionError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearSelectedSession());
  }, [dispatch]);

  return {
    // State
    sessions,
    filtered,
    selected,
    counts,
    loading,
    detailLoading,
    creating,
    actionLoading,
    error,
    actionError,
    activeTab,
    // Actions
    loadSessions,
    loadSessionDetails,
    requestSession,
    acceptSession,
    rejectSession,
    cancelSession,
    completeSession,
    changeTab,
    clearErrors,
    clearDetail,
  };
};

export default useSessionActions;
