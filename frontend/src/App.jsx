import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { getStoredToken } from './api/client'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import Classifier from './pages/Classifier'
import PlaceholderPage from './pages/PlaceholderPage'
import Register from './pages/Register'
import Tickets from './pages/Tickets'

function RootRedirect() {
  return <Navigate to={getStoredToken() ? '/dashboard' : '/login'} replace />
}

function GuestOnly({ children }) {
  if (getStoredToken()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/classifier" element={<Classifier />} />
            <Route path="/predictive-ml" element={<PlaceholderPage title="Predictive ML" />} />
            <Route path="/vision-scan" element={<PlaceholderPage title="Vision Scan" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
