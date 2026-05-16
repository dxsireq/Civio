import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Pencil, Scissors, Users } from 'lucide-react'
import {
  getOrganization,
  type Organization,
} from '../../api/organizations'
import { getEmployees } from '../../api/employees'
import { getServices } from '../../api/services'
import { getOrgBookings } from '../../api/bookings'
import { getErrorMessage } from '../../api/client'
import { ORG_STATUS_BADGE, ORG_STATUS_LABEL } from '../../lib/orgStatus'

interface Stats {
  employees: number | null
  services: number | null
  pendingBookings: number | null
  todayBookings: number | null
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function OrgDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const [org, setOrg] = useState<Organization | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    employees: null,
    services: null,
    pendingBookings: null,
    todayBookings: null,
  })

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getOrganization(id)
      .then((data) => {
        if (!cancelled) setOrg(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })

    Promise.all([
      getEmployees(id).catch(() => null),
      getServices(id).catch(() => null),
      getOrgBookings(id).catch(() => null),
    ]).then(([emps, svcs, bookings]) => {
      if (cancelled) return
      setStats({
        employees: emps?.length ?? null,
        services: svcs?.filter((s) => s.isActive).length ?? null,
        pendingBookings:
          bookings?.filter((b) => b.statusCode === 'created').length ?? null,
        todayBookings:
          bookings?.filter((b) => isToday(b.startAt)).length ?? null,
      })
    })

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return null

  if (error) {
    return (
      <div className="page">
        <div style={{ color: 'var(--red-600)' }}>{error}</div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="page">
        <div style={{ color: 'var(--text-soft)' }}>Загрузка…</div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            color: 'var(--text-soft)',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--indigo-700)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Мои организации
          </Link>
          <span>·</span>
          {org.name}
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 4,
              }}
            >
              <h1 className="page-title">{org.name}</h1>
              <span className={ORG_STATUS_BADGE[org.status]}>
                <span className="badge-dot" />
                {ORG_STATUS_LABEL[org.status]}
              </span>
            </div>
            <div className="page-subtitle">
              {org.city} · {org.address}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard label="Сотрудников" value={stats.employees} />
          <StatCard label="Активных услуг" value={stats.services} />
          <StatCard
            label="Записей сегодня"
            value={stats.todayBookings}
          />
          <StatCard
            label="Ожидают подтверждения"
            value={stats.pendingBookings}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 380px',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Информация об организации</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled
                title="Редактирование появится позже"
              >
                <Pencil size={13} />
                Редактировать
              </button>
            </div>
            <div className="card-body">
              <dl className="kv">
                <dt>Email</dt>
                <dd>{org.email ?? '—'}</dd>
                <dt>Телефон</dt>
                <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {org.phone ?? '—'}
                </dd>
                <dt>Сайт</dt>
                <dd>
                  {org.website ? (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--indigo-700)',
                        textDecoration: 'none',
                      }}
                    >
                      {org.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
                <dt>Адрес</dt>
                <dd>
                  {org.city}, {org.address}
                </dd>
                <dt>Описание</dt>
                <dd style={{ color: 'var(--text-soft)' }}>
                  {org.description ?? '—'}
                </dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Разделы</h2>
            </div>
            <div style={{ padding: '4px 0' }}>
              <NavLink
                to={`/organizations/${id}/employees`}
                icon={<Users size={16} />}
                label="Сотрудники"
              />
              <NavLink
                to={`/organizations/${id}/services`}
                icon={<Scissors size={16} />}
                label="Услуги"
              />
              <NavLink
                to={`/organizations/${id}/bookings`}
                icon={<Calendar size={16} />}
                label="Бронирования"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number | null
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value === null ? '—' : value}
      </div>
    </div>
  )
}

function NavLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {icon}
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
    </Link>
  )
}
