/**
 * useMatches.js
 * ─────────────
 * Custom hook: unified interface for all Matching Engine operations.
 *
 * Provides:
 *   - All match state from Redux (recommendations, mutual matches, selected, pagination)
 *   - Dispatch actions with notification feedback
 *   - Drawer open/close helpers
 *
 * Mirrors the pattern of useSessionActions.js exactly.
 *
 * Usage:
 *   const {
 *     recommendedMatches, mutualMatches, selectedMatch,
 *     recommendedLoading, mutualLoading,
 *     loadRecommendations, loadMutualMatches,
 *     openMatch, closeMatch,
 *   } = useMatches();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import {
  fetchRecommendations,
  fetchMutualMatches,
  setSelectedMatch,
  clearSelectedMatch,
  clearMatchErrors,
  setRecommendationPage,
  setMutualPage,
  selectRecommendedMatches,
  selectMutualMatches,
  selectSelectedMatch,
  selectRecommendedLoading,
  selectMutualLoading,
  selectRecommendedError,
  selectMutualError,
  selectMatchPagination,
  selectMutualPagination,
} from '../redux/matchSlice';

const useMatches = () => {
  const dispatch = useDispatch();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const recommendedMatches  = useSelector(selectRecommendedMatches);
  const mutualMatches       = useSelector(selectMutualMatches);
  const selectedMatch       = useSelector(selectSelectedMatch);
  const recommendedLoading  = useSelector(selectRecommendedLoading);
  const mutualLoading       = useSelector(selectMutualLoading);
  const recommendedError    = useSelector(selectRecommendedError);
  const mutualError         = useSelector(selectMutualError);
  const pagination          = useSelector(selectMatchPagination);
  const mutualPagination    = useSelector(selectMutualPagination);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch ranked recommendations (with optional pagination, search and sort params).
   */
  const loadRecommendations = useCallback(
    async ({ page = 0, size = 9, search = '', sortBy = 'matchScore', sortDir = 'desc' } = {}) => {
      const result = await dispatch(fetchRecommendations({ page, size, search, sortBy, sortDir }));
      if (fetchRecommendations.rejected.match(result)) {
        notifications.show({
          title  : 'Could not load recommendations',
          message: result.payload || 'Please try again later.',
          color  : 'red',
        });
      }
    },
    [dispatch]
  );

  /**
   * Fetch mutual exchange matches (with optional pagination, search and sort params).
   */
  const loadMutualMatches = useCallback(
    async ({ page = 0, size = 10, search = '', sortBy = 'matchScore', sortDir = 'desc' } = {}) => {
      const result = await dispatch(fetchMutualMatches({ page, size, search, sortBy, sortDir }));
      if (fetchMutualMatches.rejected.match(result)) {
        notifications.show({
          title  : 'Could not load mutual matches',
          message: result.payload || 'Please try again later.',
          color  : 'red',
        });
      }
    },
    [dispatch]
  );

  /**
   * Select a match and open the details drawer.
   * @param {RecommendationDTO | MatchResponseDTO} match
   */
  const openMatch = useCallback(
    (match) => {
      dispatch(setSelectedMatch(match));
    },
    [dispatch]
  );

  /**
   * Deselect match and close the details drawer.
   */
  const closeMatch = useCallback(() => {
    dispatch(clearSelectedMatch());
  }, [dispatch]);

  /**
   * Change pagination page and re-fetch recommendations.
   */
  const goToPage = useCallback(
    (page, search = '', sortBy = 'matchScore', sortDir = 'desc') => {
      dispatch(setRecommendationPage(page));
      dispatch(fetchRecommendations({ page, size: pagination.size, search, sortBy, sortDir }));
    },
    [dispatch, pagination.size]
  );

  /**
   * Change pagination page and re-fetch mutual matches.
   */
  const goToMutualPage = useCallback(
    (page, search = '', sortBy = 'matchScore', sortDir = 'desc') => {
      dispatch(setMutualPage(page));
      dispatch(fetchMutualMatches({ page, size: mutualPagination.size, search, sortBy, sortDir }));
    },
    [dispatch, mutualPagination.size]
  );

  /**
   * Clear all match error states.
   */
  const clearErrors = useCallback(() => {
    dispatch(clearMatchErrors());
  }, [dispatch]);

  return {
    // State
    recommendedMatches,
    mutualMatches,
    selectedMatch,
    recommendedLoading,
    mutualLoading,
    recommendedError,
    mutualError,
    pagination,
    mutualPagination,
    // Actions
    loadRecommendations,
    loadMutualMatches,
    openMatch,
    closeMatch,
    goToPage,
    goToMutualPage,
    clearErrors,
  };
};

export default useMatches;
