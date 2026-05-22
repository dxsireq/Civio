import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import {
  getAllOrganizations,
  type Organization,
  type OrganizationStatus,
} from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import { TopbarLeft } from '../../components/Topbar'

type FilterValue = OrganizationStatus | 'all'

interface FilterTab {
  value: FilterValue
  label: string
}

const FILTERS: FilterTab[] = [
  { value: 'all', label: 'Все' },
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрены' },
  { value: 'rejected', label: 'Отклонены' },
  { value: 'blocked', label: 'Заблокированы' },
]

const STATUS_LABEL: Record<OrganizationStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  blocked: 'Заблокирована',
}

const STATUS_BADGE: Record<OrganizationStatus, string> = {
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
  blocked: 'badge badge-blocked',
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

function StatusBadge({ status }: { status: OrganizationStatus }) {
  return (
    <span className={STATUS_BADGE[status]}>
      <span className="badge-dot" />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function AdminOrgsPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<Organization[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    getAllOrganizations()
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

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      blocked: 0,
    }
    if (!orgs) return c
    c.all = orgs.length
    for (const o of orgs) c[o.status]++
    return c
  }, [orgs])

  const visible = useMemo(() => {
    if (!orgs) return []
    const q = search.trim().toLowerCase()
    return orgs.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false
      if (q && !o.name.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [orgs, filter, search])

  const isLoading = orgs === null && !error

  return (
    <>
      <TopbarLeft>
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
            placeholder="Поиск по названию или городу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, height: 36 }}
          />
        </div>
      </TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Организации</h1>
            <div className="page-subtitle">
              Модерация заявок и управление зарегистрированными организациями
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
            <div style={{ padding: 32, color: 'var(--text-soft)' }}>
              Загрузка…
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              Нет организаций по выбранному фильтру
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Город</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/organizations/${o.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>{o.name}</td>
                    <td className="cell-muted">{o.city}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td
                      className="cell-muted"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/organizations/${o.id}`)
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
