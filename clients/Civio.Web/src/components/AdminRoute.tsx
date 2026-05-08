import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function AdminRoute() {
  const token = useAuthStore((s) => s.token)
  const isAdmin = useAuthStore((s) => s.isAdmin)()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
