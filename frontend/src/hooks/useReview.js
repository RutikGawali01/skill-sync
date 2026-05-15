/**
 * useReview.js
 * ────────────
 * Custom hook: unified interface for all review + trust operations.
 *
 * Provides:
 *   - All review/trust state from Redux
 *   - Action dispatchers with toast notification feedback
 *   - Submit flow helpers
 *
 * Usage:
 *   const { userReviews, trustData, loadUserReviews, submitNewReview } = useReview();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import {
  submitReview,
  fetchUserReviews,
  fetchSessionReviews,
  clearReviewErrors,
  resetSubmitSuccess,
  clearSessionReviews,
  selectUserReviews,
  selectSessionReviews,
  selectReviewsLoading,
  selectSessionRLoading,
  selectSubmitting,
  selectReviewError,
  selectSubmitError,
  selectSubmitSuccess,
  selectAverageRating,
  selectRatingDistribution,
} from '../redux/review/reviewSlice';
import {
  fetchTrustScore,
  clearTrustError,
  clearTrustData,
  selectTrustData,
  selectTrustLoading,
  selectTrustError,
} from '../redux/review/trustSlice';

const useReview = () => {
  const dispatch = useDispatch();

  // ── Review Selectors ────────────────────────────────────────────────────────
  const userReviews        = useSelector(selectUserReviews);
  const sessionReviews     = useSelector(selectSessionReviews);
  const reviewsLoading     = useSelector(selectReviewsLoading);
  const sessionRLoading    = useSelector(selectSessionRLoading);
  const submitting         = useSelector(selectSubmitting);
  const reviewError        = useSelector(selectReviewError);
  const submitError        = useSelector(selectSubmitError);
  const submitSuccess      = useSelector(selectSubmitSuccess);
  const averageRating      = useSelector(selectAverageRating);
  const ratingDistribution = useSelector(selectRatingDistribution);

  // ── Trust Selectors ─────────────────────────────────────────────────────────
  const trustData    = useSelector(selectTrustData);
  const trustLoading = useSelector(selectTrustLoading);
  const trustError   = useSelector(selectTrustError);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const loadUserReviews = useCallback((userId) => {
    dispatch(fetchUserReviews(userId));
  }, [dispatch]);

  const loadSessionReviews = useCallback((sessionId) => {
    dispatch(fetchSessionReviews(sessionId));
  }, [dispatch]);

  const loadTrustScore = useCallback((userId) => {
    dispatch(fetchTrustScore(userId));
  }, [dispatch]);

  /**
   * Submit a review with toast feedback.
   * @returns {Promise<boolean>} true on success
   */
  const submitNewReview = useCallback(async (payload) => {
    const result = await dispatch(submitReview(payload));
    if (submitReview.fulfilled.match(result)) {
      notifications.show({
        title: 'Review Submitted! 🌟',
        message: 'Thank you for your feedback!',
        color: 'teal',
        autoClose: 4000,
        radius: 'md',
      });
      return true;
    }
    notifications.show({
      title: 'Review Failed',
      message: result.payload || 'Could not submit review. Please try again.',
      color: 'red',
      autoClose: 5000,
      radius: 'md',
    });
    return false;
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearReviewErrors());
    dispatch(clearTrustError());
  }, [dispatch]);

  const resetSuccess = useCallback(() => {
    dispatch(resetSubmitSuccess());
  }, [dispatch]);

  const clearReviews = useCallback(() => {
    dispatch(clearSessionReviews());
  }, [dispatch]);

  const clearTrust = useCallback(() => {
    dispatch(clearTrustData());
  }, [dispatch]);

  return {
    // Review State
    userReviews,
    sessionReviews,
    reviewsLoading,
    sessionRLoading,
    submitting,
    reviewError,
    submitError,
    submitSuccess,
    averageRating,
    ratingDistribution,
    // Trust State
    trustData,
    trustLoading,
    trustError,
    // Actions
    loadUserReviews,
    loadSessionReviews,
    loadTrustScore,
    submitNewReview,
    clearErrors,
    resetSuccess,
    clearReviews,
    clearTrust,
  };
};

export default useReview;
