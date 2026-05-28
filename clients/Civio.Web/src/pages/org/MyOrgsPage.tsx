import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus, Shield } from 'lucide-react'
import { getMyOrganizations } from '../../api/organizations'
import { getMyEmployeeRecords, type EmployeeWithOrg } from '../../api/employees'
import type { Organization } from '../../api/admin'
import { useAuthStore } from '../../store/auth'
import { getErrorMessage } from '../../api/client'
import { ORG_STATUS_BADGE, ORG_STATUS_LABEL } from '../../lib/orgStatus'
import type { OrganizationStatus } from '../../api/admin'

function OrgGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
      {children}
    </div>
  )
}

function OrgCard({
  to, name, subtitle, description, status, role,
}: {
  to: string
  name: string
  subtitle: string
  description?: string
  status: OrganizationStatus
  role?: string
}) {
  return (
    <Link
      to={to}
      className="card"
      style={{ padding: 20, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
        <span className={ORG_STATUS_BADGE[status]}>
          <span className="badge-dot" />
          {ORG_STATUS_LABEL[status]}
        </span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{subtitle}</div>
      {description && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {description}
        </div>
      )}
      {role && (
        <div style={{ fontSize: 12, color: 'var(--indigo-600)', fontWeight: 500 }}>{role}</div>
      )}
    </Link>
  )
}

export function MyOrgsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.roles.includes('PlatformAdmin') ?? false
  const [orgs, setOrgs] = useState<Organization[] | null>(null)
  const [employeeOrgs, setEmployeeOrgs] = useState<EmployeeWithOrg[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getMyOrganizations(), getMyEmployeeRecords()])
      .then(([ownerOrgs, empOrgs]) => {
        if (!cancelled) {
          setOrgs(ownerOrgs)
          setEmployeeOrgs(empOrgs)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="civio"
      style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}
    >
      <div
        className="topbar"
        style={{ background: 'white', borderBottom: '1px solid var(--border)' }}
      >
        <span className="civio-logo">
          <span className="civio-logo-mark">C</span>
          Civio
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAdmin && (
            <Link
              to="/admin/organizations"
              className="btn btn-ghost btn-sm"
              title="Админ-панель"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <Shield size={14} />
              Админ-панель
            </Link>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={14} />
            Выйти
          </button>
          <Link
            to="/profile"
            aria-label="Профиль"
            title="Профиль"
            style={{ textDecoration: 'none' }}
          >
            <span className="avatar">
              {(user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')}
            </span>
          </Link>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Рабочее пространство</h1>
            <div className="page-subtitle">Организации и рабочие места</div>
          </div>
        </div>

        {error ? (
          <div className="card" style={{ padding: 24, color: 'var(--red-600)' }}>
            {error}
          </div>
        ) : orgs === null || employeeOrgs === null ? (
          <div className="card" style={{ padding: 24, color: 'var(--text-soft)' }}>
            Загрузка…
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Мои организации</h2>
                <Link to="/organizations/new" className="btn btn-primary btn-sm">
                  <Plus size={13} />
                  Создать
                </Link>
              </div>
              {orgs.length === 0 ? (
                <div className="card empty-state" style={{ padding: 32 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                    У вас пока нет организаций
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
                    Создайте первую, чтобы начать принимать записи
                  </div>
                  <Link to="/organizations/new" className="btn btn-primary btn-sm">
                    <Plus size={13} />
                    Создать организацию
                  </Link>
                </div>
              ) : (
                <OrgGrid>
                  {orgs.map((o) => (
                    <OrgCard
                      key={o.id}
                      to={`/organizations/${o.id}`}
                      name={o.name}
                      subtitle={`${o.city} · ${o.address}`}
                      description={o.description ?? undefined}
                      status={o.status}
                    />
                  ))}
                </OrgGrid>
              )}
            </div>

            {employeeOrgs.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Работаю в</h2>
                <OrgGrid>
                  {employeeOrgs.map((e) => (
                    <OrgCard
                      key={e.id}
                      to={`/employee/${e.organizationId}`}
                      name={e.organizationName}
                      subtitle={e.organizationCity}
                      description={e.position ?? undefined}
                      status={e.organizationStatus as OrganizationStatus}
                      role="Сотрудник"
                    />
                  ))}
                </OrgGrid>
              </div>
            )}
          </>
        )}
      </div>

      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              width: '100%',
              maxWidth: 360,
              margin: 16,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Выйти из аккаунта?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 20 }}>
              Вы будете перенаправлены на страницу входа.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Отмена
              </button>
              <button className="btn btn-danger btn-sm" onClick={onLogout}>
                <LogOut size={14} />
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
