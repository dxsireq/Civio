import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/auth'

function initialsOf(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? ''
  const b = lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

export function AdminLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'sidebar-link' + (isActive ? ' active' : '')

  return (
    <div className="civio civio-app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="civio-logo">
              <span className="civio-logo-mark">C</span>
              <span>
                Civio{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                  Admin
                </span>
              </span>
            </span>
          </div>
          <nav className="sidebar-nav">
            <div className="sidebar-nav-section">Модерация</div>
            <NavLink to="/admin/organizations" className={linkClass}>
              <Building2 size={16} />
              Организации
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
                  Администратор
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
