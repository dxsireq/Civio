import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  approveOrganization,
  blockOrganization,
  getAllOrganizations,
  rejectOrganization,
  type Organization,
  type OrganizationStatus,
} from '../../api/admin'
import { getErrorMessage } from '../../api/client'

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

type Action = 'approve' | 'reject' | 'block'

export function AdminOrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [org, setOrg] = useState<Organization | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [pending, setPending] = useState<Action | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getAllOrganizations()
      .then((list) => {
        if (cancelled) return
        const found = list.find((o) => o.id === id)
        if (!found) {
          setLoadError('Организация не найдена')
          return
        }
        setOrg(found)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return null

  const handleAction = async (action: Action) => {
    if (!org) return

    const trimmed = comment.trim()
    if (action === 'reject' && !trimmed) {
      setActionError('Комментарий обязателен для отклонения')
      return
    }

    setActionError(null)
    setPending(action)
    try {
      const payload = trimmed ? { comment: trimmed } : {}
      let updated: Organization
      if (action === 'approve') {
        updated = await approveOrganization(org.id, payload)
      } else if (action === 'reject') {
        updated = await rejectOrganization(org.id, { comment: trimmed })
      } else {
        updated = await blockOrganization(org.id, payload)
      }
      setOrg(updated)
      setComment('')
      toast.success(
        action === 'approve'
          ? 'Организация одобрена'
          : action === 'reject'
            ? 'Организация отклонена'
            : 'Организация заблокирована',
      )
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPending(null)
    }
  }

  if (loadError) {
    return (
      <div className="page">
        <Link to="/admin/organizations" className="crumb">
          <ArrowLeft size={14} />
          Организации
        </Link>
        <div style={{ color: 'var(--red-600)', marginTop: 16 }}>{loadError}</div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="page">
        <Link to="/admin/organizations" className="crumb">
          <ArrowLeft size={14} />
          Организации
        </Link>
        <div style={{ color: 'var(--text-soft)', marginTop: 16 }}>
          Загрузка…
        </div>
      </div>
    )
  }

  const isActing = pending !== null
  const status = org.status

  return (
    <>
      <div className="topbar">
        <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>
          Модерация · Карточка организации
        </span>
      </div>

      <div className="page">
        <Link to="/admin/organizations" className="crumb">
          <ArrowLeft size={14} />
          Организации
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{org.name}</h1>
            <div className="page-subtitle">ID {org.id}</div>
          </div>
          <span
            className={STATUS_BADGE[status]}
            style={{ fontSize: 13, padding: '4px 12px' }}
          >
            <span className="badge-dot" />
            {STATUS_LABEL[status]}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Основная информация</h2>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Название</dt>
                  <dd>{org.name}</dd>
                  <dt>Описание</dt>
                  <dd style={{ color: 'var(--text-soft)' }}>
                    {org.description ?? '—'}
                  </dd>
                  <dt>Дата создания</dt>
                  <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatDateTime(org.createdAt)}
                  </dd>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Контакты и адрес</h2>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Город</dt>
                  <dd>{org.city}</dd>
                  <dt>Адрес</dt>
                  <dd>{org.address}</dd>
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
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Владелец</h2>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>User ID</dt>
                  <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {org.ownerUserId}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'sticky',
              top: 24,
            }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Решение</h2>
              </div>
              <div className="card-body">
                <div className="field">
                  <label className="field-label" htmlFor="comment">
                    Комментарий модератора
                  </label>
                  <textarea
                    id="comment"
                    className="textarea"
                    placeholder="Будет отправлен владельцу. Необязательно для одобрения, обязательно для отклонения."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isActing}
                  />
                  {actionError && (
                    <div className="field-error">{actionError}</div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-success btn-block"
                    disabled={isActing || status === 'approved'}
                    onClick={() => handleAction('approve')}
                  >
                    <Check size={15} />
                    {pending === 'approve' ? 'Одобряем…' : 'Одобрить'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-block"
                    disabled={isActing || status === 'rejected'}
                    onClick={() => handleAction('reject')}
                  >
                    <X size={15} />
                    {pending === 'reject' ? 'Отклоняем…' : 'Отклонить'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-dark btn-block"
                    disabled={isActing || status === 'blocked'}
                    onClick={() => handleAction('block')}
                  >
                    {pending === 'block'
                      ? 'Блокируем…'
                      : 'Заблокировать'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
