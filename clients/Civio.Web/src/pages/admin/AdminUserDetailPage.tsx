import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Unlock } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ALL_ROLES,
  blockUser,
  getUserById,
  unblockUser,
  updateUserRoles,
  type AdminUserDetail,
  type UserRole,
} from '../../api/adminUsers'
import { getErrorMessage } from '../../api/client'
import { useAuthStore } from '../../store/auth'

const ROLE_LABEL: Record<UserRole, string> = {
  Citizen: 'Гражданин',
  OrganizationEmployee: 'Сотрудник организации',
  PlatformAdmin: 'Администратор платформы',
}

const ORG_STATUS_BADGE: Record<string, string> = {
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
  blocked: 'badge badge-blocked',
}

const ORG_STATUS_LABEL: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  blocked: 'Заблокирована',
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

function fullName(u: AdminUserDetail): string {
  const parts = [u.lastName, u.firstName, u.middleName].filter(Boolean)
  return parts.join(' ').trim() || u.email
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(new Set())
  const [savingRoles, setSavingRoles] = useState(false)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [blockPending, setBlockPending] = useState(false)
  const [blockError, setBlockError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setUser(null)
    setLoadError(null)
    getUserById(id)
      .then((data) => {
        if (cancelled) return
        setUser(data)
        setSelectedRoles(new Set(data.roles as UserRole[]))
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const isSelf = useMemo(
    () => !!user && !!currentUser && user.id === currentUser.id,
    [user, currentUser],
  )

  const rolesDirty = useMemo(() => {
    if (!user) return false
    const current = new Set(user.roles)
    if (current.size !== selectedRoles.size) return true
    for (const r of selectedRoles) if (!current.has(r)) return true
    return false
  }, [user, selectedRoles])

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  const handleSaveRoles = async () => {
    if (!user) return
    if (isSelf && !selectedRoles.has('PlatformAdmin')) {
      setRolesError('Нельзя снять с себя роль администратора')
      return
    }
    setRolesError(null)
    setSavingRoles(true)
    try {
      const updated = await updateUserRoles(user.id, Array.from(selectedRoles))
      setUser(updated)
      setSelectedRoles(new Set(updated.roles as UserRole[]))
      toast.success('Роли обновлены')
    } catch (err) {
      setRolesError(getErrorMessage(err))
    } finally {
      setSavingRoles(false)
    }
  }

  const handleToggleBlock = async () => {
    if (!user) return
    if (isSelf) {
      setBlockError('Нельзя заблокировать самого себя')
      return
    }
    setBlockError(null)
    setBlockPending(true)
    try {
      const updated = user.isActive
        ? await blockUser(user.id)
        : await unblockUser(user.id)
      setUser(updated)
      toast.success(updated.isActive ? 'Разблокирован' : 'Заблокирован')
    } catch (err) {
      setBlockError(getErrorMessage(err))
    } finally {
      setBlockPending(false)
    }
  }

  if (!id) return null

  if (loadError) {
    return (
      <div className="page">
        <Link to="/admin/users" className="crumb">
          <ArrowLeft size={14} />
          Пользователи
        </Link>
        <div style={{ color: 'var(--red-600)', marginTop: 16 }}>{loadError}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <Link to="/admin/users" className="crumb">
          <ArrowLeft size={14} />
          Пользователи
        </Link>
        <div style={{ color: 'var(--text-soft)', marginTop: 16 }}>Загрузка…</div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>
          Управление · Карточка пользователя
        </span>
      </div>

      <div className="page">
        <Link to="/admin/users" className="crumb">
          <ArrowLeft size={14} />
          Пользователи
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{fullName(user)}</h1>
            <div className="page-subtitle">{user.email}</div>
          </div>
          {user.isActive ? (
            <span
              className="badge badge-approved"
              style={{ fontSize: 13, padding: '4px 12px' }}
            >
              <span className="badge-dot" />
              Активен
            </span>
          ) : (
            <span
              className="badge badge-blocked"
              style={{ fontSize: 13, padding: '4px 12px' }}
            >
              <span className="badge-dot" />
              Заблокирован
            </span>
          )}
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
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                  <dt>Имя</dt>
                  <dd>{user.firstName}</dd>
                  <dt>Фамилия</dt>
                  <dd>{user.lastName}</dd>
                  <dt>Отчество</dt>
                  <dd>{user.middleName ?? '—'}</dd>
                  <dt>Телефон</dt>
                  <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {user.phone ?? '—'}
                  </dd>
                  <dt>Зарегистрирован</dt>
                  <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatDateTime(user.createdAt)}
                  </dd>
                  <dt>Обновлён</dt>
                  <dd style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {user.updatedAt ? formatDateTime(user.updatedAt) : '—'}
                  </dd>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Организации владельца</h2>
              </div>
              <div className="card-body">
                {user.ownedOrganizations.length === 0 ? (
                  <div style={{ color: 'var(--text-soft)' }}>
                    Не владеет организациями
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {user.ownedOrganizations.map((o) => (
                      <Link
                        key={o.id}
                        to={`/admin/organizations/${o.id}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          color: 'var(--text)',
                          textDecoration: 'none',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{o.name}</span>
                        <span className={ORG_STATUS_BADGE[o.status] ?? 'badge'}>
                          <span className="badge-dot" />
                          {ORG_STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
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
                <h2 className="card-title">Роли</h2>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ALL_ROLES.map((role) => {
                    const checked = selectedRoles.has(role)
                    const disabled =
                      savingRoles ||
                      (isSelf && role === 'PlatformAdmin' && checked)
                    return (
                      <label
                        key={role}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.6 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleRole(role)}
                          style={{ marginTop: 3 }}
                        />
                        <span>
                          <div style={{ fontWeight: 500 }}>
                            {ROLE_LABEL[role]}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {role}
                          </div>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {rolesError && (
                  <div className="field-error" style={{ marginTop: 12 }}>
                    {rolesError}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 16 }}
                  disabled={!rolesDirty || savingRoles}
                  onClick={handleSaveRoles}
                >
                  {savingRoles ? 'Сохраняем…' : 'Сохранить роли'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Статус</h2>
              </div>
              <div className="card-body">
                <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 12 }}>
                  {user.isActive
                    ? 'Пользователь активен, может входить в систему.'
                    : 'Пользователь заблокирован, вход в систему запрещён.'}
                </div>
                {blockError && (
                  <div className="field-error" style={{ marginBottom: 12 }}>
                    {blockError}
                  </div>
                )}
                {user.isActive ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-block"
                    disabled={blockPending || isSelf}
                    onClick={handleToggleBlock}
                  >
                    <Lock size={15} />
                    {blockPending ? 'Блокируем…' : 'Заблокировать'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success btn-block"
                    disabled={blockPending}
                    onClick={handleToggleBlock}
                  >
                    <Unlock size={15} />
                    {blockPending ? 'Разблокируем…' : 'Разблокировать'}
                  </button>
                )}
                {isSelf && user.isActive && (
                  <div
                    style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}
                  >
                    Нельзя заблокировать самого себя.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
