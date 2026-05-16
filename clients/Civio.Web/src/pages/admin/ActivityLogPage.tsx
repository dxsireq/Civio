import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  getActivityLog,
  type ActivityLogEntityType,
  type ActivityLogItem,
  type ActivityLogPage,
} from '../../api/activityLog'
import { getErrorMessage } from '../../api/client'

type FilterValue = 'all' | ActivityLogEntityType

interface FilterTab {
  value: FilterValue
  label: string
}

const FILTERS: FilterTab[] = [
  { value: 'all', label: 'Все' },
  { value: 'organization', label: 'Организации' },
  { value: 'booking', label: 'Бронирования' },
]

const PAGE_SIZE = 50

const ORG_STATUS_LABEL: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  blocked: 'Заблокирована',
}

const BOOKING_STATUS_LABEL: Record<string, string> = {
  created: 'Создана',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  rejected: 'Отклонена',
  completed: 'Завершена',
}

function statusLabel(entityType: string, code: string | null): string {
  if (!code) return '—'
  const map = entityType === 'organization' ? ORG_STATUS_LABEL : BOOKING_STATUS_LABEL
  return map[code] ?? code
}

function statusBadgeClass(entityType: string, code: string | null): string {
  if (!code) return 'badge badge-neutral'
  if (entityType === 'organization') {
    return (
      {
        pending: 'badge badge-pending',
        approved: 'badge badge-approved',
        rejected: 'badge badge-rejected',
        blocked: 'badge badge-blocked',
      } as Record<string, string>
    )[code] ?? 'badge badge-neutral'
  }
  return (
    {
      created: 'badge badge-created',
      confirmed: 'badge badge-confirmed',
      cancelled: 'badge badge-cancelled',
      rejected: 'badge badge-rejected',
      completed: 'badge badge-completed',
    } as Record<string, string>
  )[code] ?? 'badge badge-neutral'
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function entityHref(item: ActivityLogItem): string | null {
  if (item.entityType === 'organization') return `/admin/organizations/${item.entityId}`
  return null
}

function ActorCell({ item }: { item: ActivityLogItem }) {
  if (!item.actorId) {
    return <span style={{ color: 'var(--text-muted)' }}>Система</span>
  }
  return (
    <div>
      <div style={{ fontWeight: 500 }}>{item.actorFullName ?? item.actorEmail ?? '—'}</div>
      {item.actorFullName && item.actorEmail && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.actorEmail}</div>
      )}
    </div>
  )
}

function ActionCell({ item }: { item: ActivityLogItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {item.oldValue && (
        <>
          <span className={statusBadgeClass(item.entityType, item.oldValue)}>
            {statusLabel(item.entityType, item.oldValue)}
          </span>
          <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
        </>
      )}
      <span className={statusBadgeClass(item.entityType, item.newValue)}>
        {statusLabel(item.entityType, item.newValue)}
      </span>
    </div>
  )
}

function CommentCell({ comment }: { comment: string | null }) {
  if (!comment) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const truncated = comment.length > 80 ? comment.slice(0, 77) + '…' : comment
  return (
    <span title={comment} style={{ color: 'var(--text-soft)' }}>
      {truncated}
    </span>
  )
}

function EntityCell({ item }: { item: ActivityLogItem }) {
  const href = entityHref(item)
  const label = item.entityName ?? item.entityId
  const typeLabel = item.entityType === 'organization' ? 'Организация' : 'Бронирование'
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{typeLabel}</div>
      {href ? (
        <Link
          to={href}
          onClick={(e) => e.stopPropagation()}
          style={{ color: 'var(--indigo-700)', textDecoration: 'none', fontWeight: 500 }}
        >
          {label}
        </Link>
      ) : (
        <span style={{ fontWeight: 500 }}>{label}</span>
      )}
    </div>
  )
}

export function ActivityLogPage() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ActivityLogPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const query = {
      entityType: filter === 'all' ? undefined : filter,
      from: from ? new Date(from + 'T00:00:00').toISOString() : undefined,
      to: to ? new Date(to + 'T23:59:59.999').toISOString() : undefined,
      page,
      pageSize: PAGE_SIZE,
    }
    getActivityLog(query)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter, from, to, page])

  const totalPages = useMemo(() => {
    if (!data || data.total === 0) return 1
    return Math.ceil(data.total / data.pageSize)
  }, [data])

  const handleFilterChange = (value: FilterValue) => {
    setFilter(value)
    setPage(1)
  }

  const handleFromChange = (value: string) => {
    setFrom(value)
    setPage(1)
  }

  const handleToChange = (value: string) => {
    setTo(value)
    setPage(1)
  }

  const handleReset = () => {
    setFrom('')
    setTo('')
    setPage(1)
  }

  const items = data?.items ?? []

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-soft)',
            }}
          >
            С
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              style={{ height: 36 }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-soft)',
            }}
          >
            По
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              style={{ height: 36 }}
            />
          </label>
          {(from || to) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Журнал действий</h1>
            <div className="page-subtitle">
              События модерации организаций и изменений статусов бронирований
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
                  onClick={() => handleFilterChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div style={{ padding: 32, color: 'var(--red-600)' }}>{error}</div>
          ) : loading && !data ? (
            <div style={{ padding: 32, color: 'var(--text-soft)' }}>Загрузка…</div>
          ) : items.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              Нет событий по выбранному фильтру
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 150 }}>Время</th>
                    <th style={{ width: 220 }}>Актор</th>
                    <th>Действие</th>
                    <th>Сущность</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.entityType}-${item.id}`}>
                      <td
                        className="cell-muted"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatDateTime(item.occurredAt)}
                      </td>
                      <td>
                        <ActorCell item={item} />
                      </td>
                      <td>
                        <ActionCell item={item} />
                      </td>
                      <td>
                        <EntityCell item={item} />
                      </td>
                      <td>
                        <CommentCell comment={item.comment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                  Показано {(data!.page - 1) * data!.pageSize + 1}–
                  {Math.min(data!.page * data!.pageSize, data!.total)} из {data!.total}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Назад
                  </button>
                  <span
                    style={{
                      padding: '0 8px',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                    }}
                  >
                    Стр {page} из {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Вперёд →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
