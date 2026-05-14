import { Navigate, Outlet } from 'react-router-dom'

import { getStoredToken } from '../api/client'

export default function ProtectedRoute() {
  if (!getStoredToken()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
