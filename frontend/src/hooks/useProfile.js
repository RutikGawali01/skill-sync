/**
 * useProfile.js
 * ─────────────
 * Custom hook: unified interface for all profile operations.
 *
 * Provides:
 *   - profile data + status flags from Redux
 *   - fetchMyProfile()   — dispatch fetch thunk
 *   - handleEdit()       — enter edit mode
 *   - handleCancel()     — exit edit mode
 *   - handleUpdate(dto)  — dispatch update thunk, returns boolean success
 *
 * Usage:
 *   const { profile, loading, isEditing, handleEdit, handleUpdate } = useProfile();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyProfile as fetchMyProfileThunk,
  updateProfile as updateProfileThunk,
  setEditing,
  clearProfileError,
  selectProfile,
  selectProfileLoading,
  selectProfileUpdating,
  selectProfileError,
  selectIsEditing,
} from '../redux/profileSlice';

const useProfile = () => {
  const dispatch = useDispatch();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const profile  = useSelector(selectProfile);
  const loading  = useSelector(selectProfileLoading);
  const updating = useSelector(selectProfileUpdating);
  const error    = useSelector(selectProfileError);
  const isEditing = useSelector(selectIsEditing);

  // ── Actions ────────────────────────────────────────────────────────────────

  const fetchMyProfile = useCallback(() => {
    dispatch(fetchMyProfileThunk());
  }, [dispatch]);

  const handleEdit = useCallback(() => {
    dispatch(clearProfileError());
    dispatch(setEditing(true));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(clearProfileError());
    dispatch(setEditing(false));
  }, [dispatch]);

  /**
   * Dispatch updateProfile thunk.
   * @param {Object} dto - UpdateProfileRequestDTO fields
   * @returns {Promise<boolean>} true on success, false on failure
   */
  const handleUpdate = useCallback(async (dto) => {
    const result = await dispatch(updateProfileThunk(dto));
    return updateProfileThunk.fulfilled.match(result);
  }, [dispatch]);

  return {
    profile,
    loading,
    updating,
    error,
    isEditing,
    fetchMyProfile,
    handleEdit,
    handleCancel,
    handleUpdate,
  };
};

export default useProfile;
