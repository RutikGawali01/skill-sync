import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';


const ProtectedRoute = ({ redirectTo = '/login' }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
