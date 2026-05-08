import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { getMyOrganizations } from '../../api/organizations'
import type { Organization } from '../../api/admin'
import { useAuthStore } from '../../store/auth'
import { getErrorMessage } from '../../api/client'
import { ORG_STATUS_BADGE, ORG_STATUS_LABEL } from '../../lib/orgStatus'

export function MyOrgsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [orgs, setOrgs] = useState<Organization[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMyOrganizations()
      .then((data) => {
        if (!cancelled) setOrgs(data)
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
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            <LogOut size={14} />
            Выйти
          </button>
          <span className="avatar">
            {(user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')}
          </span>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Мои организации</h1>
            <div className="page-subtitle">
              Управляйте своими организациями
            </div>
          </div>
          <Link to="/organizations/new" className="btn btn-primary">
            <Plus size={14} />
            Создать организацию
          </Link>
        </div>

        {error ? (
          <div className="card" style={{ padding: 24, color: 'var(--red-600)' }}>
            {error}
          </div>
        ) : orgs === null ? (
          <div
            className="card"
            style={{ padding: 24, color: 'var(--text-soft)' }}
          >
            Загрузка…
          </div>
        ) : orgs.length === 0 ? (
          <div className="card empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
              У вас пока нет организаций
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--text-soft)',
                marginBottom: 16,
              }}
            >
              Создайте первую, чтобы начать принимать записи
            </div>
            <Link to="/organizations/new" className="btn btn-primary">
              <Plus size={14} />
              Создать организацию
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {orgs.map((o) => (
              <Link
                key={o.id}
                to={`/organizations/${o.id}`}
                className="card"
                style={{
                  padding: 20,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{o.name}</div>
                  <span className={ORG_STATUS_BADGE[o.status]}>
                    <span className="badge-dot" />
                    {ORG_STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                  {o.city} · {o.address}
                </div>
                {o.description && (
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {o.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
