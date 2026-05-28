import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Building2,
  LayoutDashboard,
  LogOut,
  ScrollText,
  User as UserIcon,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { TopbarSlotContext } from './Topbar'

function initialsOf(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? ''
  const b = lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

export function AdminLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [topbarLeftEl, setTopbarLeftEl] = useState<HTMLDivElement | null>(null)

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
            <NavLink to="/admin/users" className={linkClass}>
              <Users size={16} />
              Пользователи
            </NavLink>
            <div className="sidebar-nav-section">Система</div>
            <NavLink to="/admin/activity-log" className={linkClass}>
              <ScrollText size={16} />
              Журнал действий
            </NavLink>
          </nav>
          <div className="sidebar-foot">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link
                to="/profile"
                title="Открыть профиль"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 8,
                  padding: 4,
                  margin: -4,
                }}
              >
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
              </Link>
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
          <div className="topbar">
            <div
              ref={setTopbarLeftEl}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                color: 'var(--text-soft)',
                minWidth: 0,
                flex: 1,
              }}
            />
            <Link
              to="/"
              className="btn btn-ghost btn-sm"
              title="Основной интерфейс"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 8 }}
            >
              <LayoutDashboard size={14} />
              Основной интерфейс
            </Link>
            <Link
              to="/profile"
              aria-label="Профиль"
              title="Профиль"
              className="btn btn-ghost btn-sm"
              style={{
                padding: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserIcon size={16} />
            </Link>
          </div>
          <TopbarSlotContext.Provider value={topbarLeftEl}>
            <Outlet />
          </TopbarSlotContext.Provider>
        </main>
      </div>
    </div>
  )
}
