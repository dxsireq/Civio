import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { Calendar, Home, LogOut, QrCode, Scissors, Shield, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { getMyEmployeeRecords, type EmployeeWithOrg } from '../api/employees'
import { TopbarSlotContext } from './Topbar'

interface EmployeeContextValue {
  employeeId: string
  orgId: string
  employeeRecord: EmployeeWithOrg
}

const EmployeeContext = createContext<EmployeeContextValue | null>(null)

export function useEmployeeContext(): EmployeeContextValue {
  const ctx = useContext(EmployeeContext)
  if (!ctx) throw new Error('useEmployeeContext must be used inside EmployeeLayout')
  return ctx
}

function initialsOf(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? ''
  const b = lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

export function EmployeeLayout() {
  const { id: orgId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.roles.includes('PlatformAdmin') ?? false
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [topbarLeftEl, setTopbarLeftEl] = useState<HTMLDivElement | null>(null)
  const [employeeRecord, setEmployeeRecord] = useState<EmployeeWithOrg | null | 'not-found'>(null)

  useEffect(() => {
    if (!orgId) return
    getMyEmployeeRecords()
      .then((records) => {
        const found = records.find((r) => r.organizationId === orgId)
        setEmployeeRecord(found ?? 'not-found')
      })
      .catch(() => setEmployeeRecord('not-found'))
  }, [orgId])

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'sidebar-link' + (isActive ? ' active' : '')

  const base = `/employee/${orgId}`

  if (employeeRecord === 'not-found') {
    return <Navigate to="/" replace />
  }

  if (employeeRecord === null) {
    return (
      <div className="civio civio-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--text-soft)', fontSize: 14 }}>Загрузка…</div>
      </div>
    )
  }

  const ctxValue: EmployeeContextValue = {
    employeeId: employeeRecord.id,
    orgId: orgId!,
    employeeRecord,
  }

  return (
    <EmployeeContext.Provider value={ctxValue}>
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
              <NavLink to={`${base}/schedule`} className={linkClass}>
                <Calendar size={16} />
                Моё расписание
              </NavLink>
              <NavLink to={`${base}/bookings`} className={linkClass}>
                <Scissors size={16} />
                Бронирования
              </NavLink>
              <NavLink to={`${base}/scan`} className={linkClass}>
                <QrCode size={16} />
                Сканер QR
              </NavLink>
            </nav>
            <div className="sidebar-foot">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  to="/profile"
                  title="Открыть профиль"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit', borderRadius: 8, padding: 4, margin: -4 }}
                >
                  <span className="avatar">{initialsOf(user?.firstName, user?.lastName)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.firstName} {user?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                  </div>
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: 6 }}
                  onClick={() => setShowLogoutConfirm(true)}
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
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-soft)', minWidth: 0, flex: 1 }}
              />
              {isAdmin && (
                <Link to="/admin/organizations" className="btn btn-ghost btn-sm" title="Админ-панель" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} />
                  Админ-панель
                </Link>
              )}
              <Link to="/profile" aria-label="Профиль" title="Профиль" className="btn btn-ghost btn-sm" style={{ padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={16} />
              </Link>
            </div>
            <TopbarSlotContext.Provider value={topbarLeftEl}>
              <Outlet />
            </TopbarSlotContext.Provider>
          </main>
        </div>
        {showLogoutConfirm && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: 24, width: '100%', maxWidth: 360, margin: 16, boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Выйти из аккаунта?</div>
              <div style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 20 }}>
                Вы будете перенаправлены на страницу входа.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowLogoutConfirm(false)}>Отмена</button>
                <button className="btn btn-danger btn-sm" onClick={onLogout}>
                  <LogOut size={14} />
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeContext.Provider>
  )
}
