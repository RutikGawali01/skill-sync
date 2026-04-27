import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute
 *
 * Wraps authenticated pages. If the user has no token in Redux (and therefore
 * no valid session), they are redirected to /login.
 *
 * SilentRefresh runs before any page renders, so by the time this component
 * is evaluated, auth.token is already populated if a valid refresh cookie exists.
 *
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/skills" element={<SkillsPage />} />
 *     ...
 *   </Route>
 */
const ProtectedRoute = ({ redirectTo = '/login' }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    // Replace so the user cannot navigate "back" to a protected page
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
