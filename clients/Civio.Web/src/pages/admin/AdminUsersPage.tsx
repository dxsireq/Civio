import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import {
  getAllUsers,
  type AdminUserListItem,
  type UserRole,
} from '../../api/adminUsers'
import { getErrorMessage } from '../../api/client'

type FilterValue = 'all' | UserRole | 'blocked'

interface FilterTab {
  value: FilterValue
  label: string
}

const FILTERS: FilterTab[] = [
  { value: 'all', label: 'Все' },
  { value: 'Citizen', label: 'Граждане' },
  { value: 'OrganizationEmployee', label: 'Сотрудники' },
  { value: 'PlatformAdmin', label: 'Администраторы' },
  { value: 'blocked', label: 'Заблокированы' },
]

const ROLE_LABEL: Record<UserRole, string> = {
  Citizen: 'Гражданин',
  OrganizationEmployee: 'Сотрудник',
  PlatformAdmin: 'Администратор',
}

const ROLE_BADGE: Record<UserRole, string> = {
  Citizen: 'badge badge-neutral',
  OrganizationEmployee: 'badge badge-approved',
  PlatformAdmin: 'badge badge-pending',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function fullName(u: AdminUserListItem): string {
  return `${u.lastName} ${u.firstName}`.trim() || u.email
}

function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {roles.map((r) => {
        const known = (r in ROLE_LABEL ? r : null) as UserRole | null
        const cls = known ? ROLE_BADGE[known] : 'badge badge-neutral'
        const label = known ? ROLE_LABEL[known] : r
        return (
          <span key={r} className={cls}>
            {label}
          </span>
        )
      })}
    </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="badge badge-approved">
      <span className="badge-dot" />
      Активен
    </span>
  ) : (
    <span className="badge badge-blocked">
      <span className="badge-dot" />
      Заблокирован
    </span>
  )
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUserListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setUsers(null)
    setError(null)
    getAllUsers()
      .then((data) => {
        if (!cancelled) setUsers(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: 0,
      Citizen: 0,
      OrganizationEmployee: 0,
      PlatformAdmin: 0,
      blocked: 0,
    }
    if (!users) return c
    c.all = users.length
    for (const u of users) {
      if (!u.isActive) c.blocked++
      for (const r of u.roles) {
        if (r in c) c[r as FilterValue]++
      }
    }
    return c
  }, [users])

  const visible = useMemo(() => {
    if (!users) return []
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filter === 'blocked') {
        if (u.isActive) return false
      } else if (filter !== 'all') {
        if (!u.roles.includes(filter)) return false
      }
      if (q) {
        const hay = `${u.email} ${u.firstName} ${u.lastName} ${u.phone ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [users, filter, search])

  const isLoading = users === null && !error

  return (
    <>
      <div className="topbar">
        <div style={{ position: 'relative', width: 320 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input"
            placeholder="Поиск по email, имени или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, height: 36 }}
          />
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Пользователи</h1>
            <div className="page-subtitle">
              Список зарегистрированных пользователей платформы
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '0 16px' }}>
            <div className="tabs">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={'tab' + (filter === f.value ? ' active' : '')}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                  <span className="count">{counts[f.value]}</span>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div style={{ padding: 32, color: 'var(--red-600)' }}>{error}</div>
          ) : isLoading ? (
            <div style={{ padding: 32, color: 'var(--text-soft)' }}>Загрузка…</div>
          ) : visible.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              Нет пользователей по выбранному фильтру
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>ФИО</th>
                  <th>Роли</th>
                  <th>Статус</th>
                  <th>Создан</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>{u.email}</td>
                    <td className="cell-muted">{fullName(u)}</td>
                    <td>
                      <RoleBadges roles={u.roles} />
                    </td>
                    <td>
                      <StatusBadge isActive={u.isActive} />
                    </td>
                    <td
                      className="cell-muted"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/users/${u.id}`)
                        }}
                      >
                        Открыть
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
