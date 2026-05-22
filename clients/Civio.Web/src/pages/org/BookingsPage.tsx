import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, Search, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  confirmBooking,
  getOrgBookings,
  rejectBooking,
  type BookingStatus,
  type BookingSummary,
} from '../../api/bookings'
import { getErrorMessage } from '../../api/client'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
} from '../../lib/bookingStatus'
import { TopbarLeft } from '../../components/Topbar'

type FilterValue = BookingStatus | 'all'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'created', label: 'Создана' },
  { value: 'confirmed', label: 'Подтверждена' },
  { value: 'completed', label: 'Завершена' },
  { value: 'cancelled', label: 'Отменена' },
  { value: 'rejected', label: 'Отклонена' },
]

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

export function BookingsPage() {
  const { id: orgId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    getOrgBookings(orgId)
      .then((data) => {
        if (!cancelled) setBookings(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [orgId])

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: 0,
      created: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    }
    if (!bookings) return c
    c.all = bookings.length
    for (const b of bookings) c[b.statusCode]++
    return c
  }, [bookings])

  const visible = useMemo(() => {
    if (!bookings) return []
    const q = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (filter !== 'all' && b.statusCode !== filter) return false
      if (q) {
        const text = `${b.serviceName} ${b.employeeFirstName ?? ''} ${b.employeeLastName ?? ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [bookings, filter, search])

  if (!orgId) return null

  const updateBooking = (id: string, statusCode: BookingStatus) => {
    setBookings(
      (prev) =>
        prev?.map((b) => (b.id === id ? { ...b, statusCode } : b)) ?? prev,
    )
  }

  const onConfirm = async (id: string) => {
    setBusyId(id)
    try {
      await confirmBooking(id)
      updateBooking(id, 'confirmed')
      toast.success('Запись подтверждена')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const onReject = async (id: string) => {
    setBusyId(id)
    try {
      await rejectBooking(id)
      updateBooking(id, 'rejected')
      toast.success('Запись отклонена')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <TopbarLeft>Бронирования</TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Бронирования</h1>
            <div className="page-subtitle">
              {bookings
                ? `${bookings.length} записей · ${counts.created} ожидают подтверждения`
                : 'Загрузка…'}
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-soft)',
            }}
          >
            <div style={{ position: 'relative', width: 280 }}>
              <Search
                size={14}
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
                placeholder="Поиск по услуге или сотруднику"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, height: 32, fontSize: 13 }}
              />
            </div>
          </div>

          {error ? (
            <div style={{ padding: 24, color: 'var(--red-600)' }}>{error}</div>
          ) : bookings === null ? (
            <div style={{ padding: 24, color: 'var(--text-soft)' }}>
              Загрузка…
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              Нет бронирований по выбранному фильтру
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Сотрудник</th>
                  <th>Дата и время</th>
                  <th>Статус</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() =>
                      navigate(`/organizations/${orgId}/bookings/${b.id}`)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>{b.serviceName}</td>
                    <td className="cell-muted">
                      {b.employeeFirstName
                        ? `${b.employeeFirstName} ${b.employeeLastName ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td
                      className="cell-muted"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatDateTime(b.startAt)}
                    </td>
                    <td>
                      <span className={BOOKING_STATUS_BADGE[b.statusCode]}>
                        <span className="badge-dot" />
                        {BOOKING_STATUS_LABEL[b.statusCode]}
                      </span>
                    </td>
                    <td className="cell-actions">
                      {b.statusCode === 'created' ? (
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={busyId === b.id}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              onConfirm(b.id)
                            }}
                          >
                            <Check size={12} />
                            Подтвердить
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red-600)' }}
                            disabled={busyId === b.id}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              onReject(b.id)
                            }}
                          >
                            <XIcon size={12} />
                            Отклонить
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={(ev) => {
                            ev.stopPropagation()
                            navigate(
                              `/organizations/${orgId}/bookings/${b.id}`,
                            )
                          }}
                        >
                          Открыть
                          <ChevronRight size={13} />
                        </button>
                      )}
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
