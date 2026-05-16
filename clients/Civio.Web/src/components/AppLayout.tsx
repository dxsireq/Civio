import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  Calendar,
  Home,
  LogOut,
  QrCode,
  Scissors,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'

function initialsOf(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? ''
  const b = lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

export function AppLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'sidebar-link' + (isActive ? ' active' : '')

  const base = `/organizations/${id}`

  return (
    <div className="civio civio-app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="civio-logo">
              <span className="civio-logo-mark">C</span>
              <span>Civio</span>
            </span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to={base} end className={linkClass}>
              <Home size={16} />
              Обзор
            </NavLink>
            <NavLink to={`${base}/employees`} className={linkClass}>
              <Users size={16} />
              Сотрудники
            </NavLink>
            <NavLink to={`${base}/services`} className={linkClass}>
              <Scissors size={16} />
              Услуги
            </NavLink>
            <NavLink to={`${base}/bookings`} className={linkClass}>
              <Calendar size={16} />
              Бронирования
            </NavLink>
            <NavLink to={`${base}/scan`} className={linkClass}>
              <QrCode size={16} />
              Сканер QR
            </NavLink>
          </nav>
          <div className="sidebar-foot">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="avatar">
                {initialsOf(user?.firstName, user?.lastName)}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {user?.email}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 6 }}
                onClick={onLogout}
                aria-label="Выйти"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
