import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={isLoggingOut ? null : { from: location }} />
  }

  return <Outlet />
}
