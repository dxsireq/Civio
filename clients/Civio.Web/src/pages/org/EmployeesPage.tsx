import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Search,
  X as XIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createEmployee,
  getEmployees,
  type Employee,
} from '../../api/employees'
import { getErrorMessage } from '../../api/client'
import { TopbarLeft } from '../../components/Topbar'
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABEL,
} from '../../lib/employeeStatus'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmployeesPage() {
  const { id: orgId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    phone: '',
    email: '',
  })
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    getEmployees(orgId)
      .then((data) => {
        if (!cancelled) setEmployees(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [orgId])

  if (!orgId) return null

  const visible = (employees ?? []).filter((e) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const full = `${e.firstName} ${e.lastName} ${e.position ?? ''}`.toLowerCase()
    return full.includes(q)
  })

  const onCreate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setCreateError('Имя и фамилия обязательны')
      return
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setCreateError('Укажите корректный email сотрудника')
      return
    }
    setCreateError(null)
    setCreating(true)
    try {
      const empty = (v: string) => (v.trim() ? v.trim() : undefined)
      const created = await createEmployee(orgId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        middleName: empty(form.middleName),
        position: empty(form.position),
        phone: empty(form.phone),
      })
      setEmployees((prev) => (prev ? [...prev, created] : [created]))
      setForm({
        firstName: '',
        lastName: '',
        middleName: '',
        position: '',
        phone: '',
        email: '',
      })
      setDrawerOpen(false)
      toast.success('Приглашение отправлено')
    } catch (err) {
      setCreateError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <TopbarLeft>Сотрудники</TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Сотрудники</h1>
            <div className="page-subtitle">
              {employees ? `${employees.length} человек` : 'Загрузка…'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', width: 240 }}>
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
                placeholder="Поиск"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, height: 36 }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDrawerOpen(true)}
            >
              <Plus size={14} />
              Добавить сотрудника
            </button>
          </div>
        </div>

        {error ? (
          <div className="card" style={{ padding: 24, color: 'var(--red-600)' }}>
            {error}
          </div>
        ) : employees === null ? (
          <div
            className="card"
            style={{ padding: 24, color: 'var(--text-soft)' }}
          >
            Загрузка…
          </div>
        ) : visible.length === 0 ? (
          <div className="card empty-state" style={{ padding: 32 }}>
            {employees.length === 0
              ? 'Сотрудников пока нет — добавьте первого'
              : 'Никто не найден'}
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Должность</th>
                  <th>Контакты</th>
                  <th>Статус</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() =>
                      navigate(`/organizations/${orgId}/employees/${e.id}`)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <span
                          className="avatar"
                          style={{ width: 36, height: 36 }}
                        >
                          {e.firstName[0]}
                          {e.lastName[0]}
                        </span>
                        <div style={{ fontWeight: 500 }}>
                          {e.firstName} {e.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="cell-muted">{e.position ?? '—'}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{e.email ?? '—'}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {e.phone ?? '—'}
                      </div>
                    </td>
                    <td>
                      <span className={EMPLOYEE_STATUS_BADGE[e.membershipStatus]}>
                        <span className="badge-dot" />
                        {EMPLOYEE_STATUS_LABEL[e.membershipStatus]}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          navigate(
                            `/organizations/${orgId}/employees/${e.id}`,
                          )
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
          </div>
        )}
      </div>

      {drawerOpen && (
        <div
          className="modal-overlay"
          onClick={() => setDrawerOpen(false)}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              background: 'white',
              height: '100%',
              padding: 24,
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <h2 className="card-title">Новый сотрудник</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть"
              >
                <XIcon size={14} />
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div className="field">
                <label className="field-label">
                  Имя <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">
                  Фамилия <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">Отчество</label>
                <input
                  className="input"
                  value={form.middleName}
                  onChange={(e) =>
                    setForm({ ...form, middleName: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">Должность</label>
                <input
                  className="input"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">Телефон</label>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">
                  Email <span className="req">*</span> — на него придёт приглашение
                </label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              {createError && (
                <div className="field-error">{createError}</div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setDrawerOpen(false)}
                  disabled={creating}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onCreate}
                  disabled={creating}
                >
                  {creating ? 'Сохраняем…' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
