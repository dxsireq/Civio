import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopbarLeft } from '../../components/Topbar'
import { useEmployeeContext } from '../../components/EmployeeLayout'
import {
  confirmBooking,
  completeBooking,
  rejectBooking,
  getOrgBookings,
  type BookingStatus,
  type BookingSummary,
} from '../../api/bookings'
import { getErrorMessage } from '../../api/client'
import { BOOKING_STATUS_BADGE, BOOKING_STATUS_LABEL } from '../../lib/bookingStatus'

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
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export function EmployeeBookingsPage() {
  const { employeeId, orgId, employeeRecord } = useEmployeeContext()
  const navigate = useNavigate()
  const [allBookings, setAllBookings] = useState<BookingSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getOrgBookings(orgId)
      .then((data) => {
        if (!cancelled) setAllBookings(data.filter((b) => b.employeeId === employeeId))
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => { cancelled = true }
  }, [orgId, employeeId])

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = { all: 0, created: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0 }
    if (!allBookings) return c
    c.all = allBookings.length
    for (const b of allBookings) c[b.statusCode]++
    return c
  }, [allBookings])

  const visible = useMemo(() => {
    if (!allBookings) return []
    return allBookings.filter((b) => filter === 'all' || b.statusCode === filter)
  }, [allBookings, filter])

  const updateStatus = (id: string, statusCode: BookingStatus) => {
    setAllBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, statusCode } : b)) ?? prev)
  }

  const onConfirm = async (id: string) => {
    setBusyId(id)
    try {
      await confirmBooking(id)
      updateStatus(id, 'confirmed')
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
      updateStatus(id, 'rejected')
      toast.success('Запись отклонена')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const onComplete = async (id: string) => {
    setBusyId(id)
    try {
      await completeBooking(id)
      updateStatus(id, 'completed')
      toast.success('Визит завершён')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <TopbarLeft>
        <span>{employeeRecord.organizationName} / Бронирования</span>
      </TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Мои бронирования</h1>
            <div className="page-subtitle">
              {allBookings
                ? `${allBookings.length} записей · ${counts.created} ожидают подтверждения`
                : 'Загрузка…'}
            </div>
          </div>
        </div>

        {error && (
          <div className="card" style={{ padding: 16, color: 'var(--red-600)', marginBottom: 16 }}>{error}</div>
        )}

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

          {allBookings === null ? (
            <div style={{ padding: 24, color: 'var(--text-soft)', fontSize: 14 }}>Загрузка…</div>
          ) : visible.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Нет записей</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-cards">
                <thead>
                  <tr>
                    <th>Дата и время</th>
                    <th>Услуга</th>
                    <th>Статус</th>
                    <th>Действия</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => (
                    <tr
                      key={b.id}
                      className="table-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/employee/${orgId}/bookings/${b.id}`)}
                    >
                      <td data-label="Дата и время" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{formatDateTime(b.startAt)}</td>
                      <td data-label="Услуга">{b.serviceName}</td>
                      <td data-label="Статус">
                        <span className={BOOKING_STATUS_BADGE[b.statusCode]}>
                          <span className="badge-dot" />
                          {BOOKING_STATUS_LABEL[b.statusCode]}
                        </span>
                      </td>
                      <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {b.statusCode === 'created' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={busyId === b.id}
                                onClick={() => onConfirm(b.id)}
                              >
                                <Check size={13} />
                                Подтвердить
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--red-600)' }}
                                disabled={busyId === b.id}
                                onClick={() => onReject(b.id)}
                              >
                                <XIcon size={13} />
                                Отклонить
                              </button>
                            </>
                          )}
                          {b.statusCode === 'confirmed' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={busyId === b.id}
                              onClick={() => onComplete(b.id)}
                            >
                              <Check size={13} />
                              Завершить
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="cell-chevron">
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
