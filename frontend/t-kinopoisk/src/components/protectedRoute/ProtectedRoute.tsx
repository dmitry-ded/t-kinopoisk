import React from 'react'
import { readToken } from '../../features/auth/authApi'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = readToken();

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
