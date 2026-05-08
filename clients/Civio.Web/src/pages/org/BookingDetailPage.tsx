import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  completeBooking,
  confirmBooking,
  getBooking,
  rejectBooking,
  type Booking,
} from '../../api/bookings'
import { getErrorMessage } from '../../api/client'
import {
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
} from '../../lib/bookingStatus'

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startIso} — ${endIso}`
  }
  const date = start.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const fmt = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${fmt(start)} – ${fmt(end)}`
}

function formatCreated(iso: string): string {
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

export function BookingDetailPage() {
  const { id: orgId, bookingId } = useParams<{
    id: string
    bookingId: string
  }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false
    getBooking(bookingId)
      .then((b) => {
        if (!cancelled) setBooking(b)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [bookingId])

  if (!orgId || !bookingId) return null

  const back = `/organizations/${orgId}/bookings`

  if (error) {
    return (
      <div className="page">
        <Link to={back} className="crumb">
          <ArrowLeft size={14} />
          Бронирования
        </Link>
        <div style={{ color: 'var(--red-600)', marginTop: 16 }}>{error}</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="page">
        <Link to={back} className="crumb">
          <ArrowLeft size={14} />
          Бронирования
        </Link>
        <div style={{ color: 'var(--text-soft)', marginTop: 16 }}>
          Загрузка…
        </div>
      </div>
    )
  }

  const onAction = async (
    action: 'confirm' | 'reject' | 'complete',
  ) => {
    setBusy(true)
    try {
      const fn =
        action === 'confirm'
          ? confirmBooking
          : action === 'reject'
            ? rejectBooking
            : completeBooking
      const updated = await fn(booking.id)
      setBooking(updated)
      toast.success(
        action === 'confirm'
          ? 'Запись подтверждена'
          : action === 'reject'
            ? 'Запись отклонена'
            : 'Запись завершена',
      )
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const status = booking.statusCode
  const empName =
    booking.employeeFirstName || booking.employeeLastName
      ? `${booking.employeeFirstName ?? ''} ${booking.employeeLastName ?? ''}`.trim()
      : '—'

  return (
    <>
      <div className="topbar">
        <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>
          Бронирование
        </div>
      </div>

      <div className="page">
        <Link to={back} className="crumb">
          <ArrowLeft size={14} />
          Бронирования
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">Запись</h1>
            <div className="page-subtitle">
              Создана {formatCreated(booking.createdAt)}
            </div>
          </div>
          <span
            className={BOOKING_STATUS_BADGE[status]}
            style={{ fontSize: 13, padding: '4px 12px' }}
          >
            <span className="badge-dot" />
            {BOOKING_STATUS_LABEL[status]}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 360px',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <Section label="Услуга">
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {booking.serviceName}
                </div>
              </Section>
              <Section label="Сотрудник">
                <div style={{ fontSize: 14, fontWeight: 500 }}>{empName}</div>
              </Section>
              <Section label="Дата и время">
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatRange(booking.startAt, booking.endAt)}
                </div>
              </Section>
              {booking.comment && (
                <Section label="Комментарий клиента">
                  <div
                    style={{
                      fontSize: 14,
                      padding: '12px 14px',
                      background: 'var(--bg-soft)',
                      borderRadius: 'var(--r)',
                      fontStyle: 'italic',
                    }}
                  >
                    «{booking.comment}»
                  </div>
                </Section>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {status === 'created' && (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-soft)',
                      marginBottom: 12,
                    }}
                  >
                    Подтвердите запись, чтобы клиент получил уведомление и
                    QR-код для входа.
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-success btn-block"
                      disabled={busy}
                      onClick={() => onAction('confirm')}
                    >
                      <Check size={15} />
                      Подтвердить
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      style={{
                        color: 'var(--red-600)',
                        borderColor: '#fecaca',
                      }}
                      disabled={busy}
                      onClick={() => onAction('reject')}
                    >
                      <XIcon size={15} />
                      Отклонить
                    </button>
                  </div>
                </>
              )}
              {status === 'confirmed' && (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-soft)',
                      marginBottom: 12,
                    }}
                  >
                    Отметьте визит как завершённый после оказания услуги.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={busy}
                    onClick={() => onAction('complete')}
                  >
                    <Check size={15} />
                    Завершить
                  </button>
                </>
              )}
              {(status === 'completed' ||
                status === 'cancelled' ||
                status === 'rejected') && (
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                  Действия по этой записи завершены.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}
