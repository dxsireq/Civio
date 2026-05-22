import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  assignServiceToEmployee,
  deactivateEmployee,
  getEmployee,
  getEmployeeServices,
  unassignServiceFromEmployee,
  updateEmployee,
  type Employee,
} from '../../api/employees'
import {
  getServices,
  type Service,
} from '../../api/services'
import {
  createWorkDay,
  deleteWorkDay,
  getWorkDays,
  type WorkDay,
} from '../../api/workDays'
import { getErrorMessage } from '../../api/client'
import { TopbarLeft } from '../../components/Topbar'

type TabKey = 'data' | 'services' | 'days'

export function EmployeeDetailPage() {
  const { id: orgId, empId } = useParams<{ id: string; empId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('data')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId || !empId) return
    let cancelled = false
    getEmployee(orgId, empId)
      .then((e) => {
        if (!cancelled) setEmployee(e)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [orgId, empId])

  if (!orgId || !empId) return null

  if (error) {
    return (
      <div className="page">
        <Link to={`/organizations/${orgId}/employees`} className="crumb">
          <ArrowLeft size={14} />
          Сотрудники
        </Link>
        <div style={{ color: 'var(--red-600)', marginTop: 16 }}>{error}</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="page">
        <Link to={`/organizations/${orgId}/employees`} className="crumb">
          <ArrowLeft size={14} />
          Сотрудники
        </Link>
        <div style={{ color: 'var(--text-soft)', marginTop: 16 }}>
          Загрузка…
        </div>
      </div>
    )
  }

  const onDeactivate = async () => {
    if (!confirm('Деактивировать сотрудника?')) return
    try {
      await deactivateEmployee(orgId, empId)
      toast.success('Сотрудник деактивирован')
      navigate(`/organizations/${orgId}/employees`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <TopbarLeft>
        Сотрудник · {employee.firstName} {employee.lastName}
      </TopbarLeft>

      <div className="page">
        <Link to={`/organizations/${orgId}/employees`} className="crumb">
          <ArrowLeft size={14} />
          Сотрудники
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <span
            className="avatar"
            style={{ width: 56, height: 56, fontSize: 18 }}
          >
            {employee.firstName[0]}
            {employee.lastName[0]}
          </span>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">
              {employee.firstName} {employee.lastName}
            </h1>
            <div className="page-subtitle">
              {employee.position ?? 'Должность не указана'}
            </div>
          </div>
          {employee.isActive && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onDeactivate}
            >
              <Trash2 size={13} />
              Деактивировать
            </button>
          )}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '0 20px' }}>
            <div className="tabs">
              <button
                type="button"
                className={'tab' + (tab === 'data' ? ' active' : '')}
                onClick={() => setTab('data')}
              >
                Данные
              </button>
              <button
                type="button"
                className={'tab' + (tab === 'services' ? ' active' : '')}
                onClick={() => setTab('services')}
              >
                Услуги
              </button>
              <button
                type="button"
                className={'tab' + (tab === 'days' ? ' active' : '')}
                onClick={() => setTab('days')}
              >
                Рабочие дни
              </button>
            </div>
          </div>

          {tab === 'data' && (
            <DataTab
              employee={employee}
              orgId={orgId}
              empId={empId}
              onSaved={setEmployee}
            />
          )}
          {tab === 'services' && (
            <ServicesTab orgId={orgId} empId={empId} />
          )}
          {tab === 'days' && <DaysTab empId={empId} />}
        </div>
      </div>
    </>
  )
}

interface DataTabProps {
  employee: Employee
  orgId: string
  empId: string
  onSaved: (e: Employee) => void
}

function DataTab({ employee, orgId, empId, onSaved }: DataTabProps) {
  const [form, setForm] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName ?? '',
    position: employee.position ?? '',
    phone: employee.phone ?? '',
    email: employee.email ?? '',
  })
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Имя и фамилия обязательны')
      return
    }
    setSaving(true)
    try {
      const empty = (v: string) => (v.trim() ? v.trim() : undefined)
      const updated = await updateEmployee(orgId, empId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: empty(form.middleName),
        position: empty(form.position),
        phone: empty(form.phone),
        email: empty(form.email),
      })
      onSaved(updated)
      toast.success('Сохранено')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Field
          label="Имя"
          value={form.firstName}
          onChange={(v) => setForm({ ...form, firstName: v })}
        />
        <Field
          label="Фамилия"
          value={form.lastName}
          onChange={(v) => setForm({ ...form, lastName: v })}
        />
        <Field
          label="Отчество"
          value={form.middleName}
          onChange={(v) => setForm({ ...form, middleName: v })}
        />
        <Field
          label="Должность"
          value={form.position}
          onChange={(v) => setForm({ ...form, position: v })}
        />
        <Field
          label="Телефон"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        <Field
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 22,
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function ServicesTab({ orgId, empId }: { orgId: string; empId: string }) {
  const [assigned, setAssigned] = useState<Service[] | null>(null)
  const [allServices, setAllServices] = useState<Service[] | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const [a, all] = await Promise.all([
      getEmployeeServices(orgId, empId),
      getServices(orgId),
    ])
    setAssigned(a)
    setAllServices(all)
  }

  useEffect(() => {
    reload().catch((err) => toast.error(getErrorMessage(err)))
  }, [orgId, empId])

  const assignedIds = new Set(assigned?.map((s) => s.id) ?? [])
  const available = (allServices ?? []).filter(
    (s) => s.isActive && !assignedIds.has(s.id),
  )

  const onAdd = async () => {
    if (!selectedId) return
    setBusy(true)
    try {
      await assignServiceToEmployee(orgId, empId, selectedId)
      setSelectedId('')
      await reload()
      toast.success('Услуга добавлена')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const onRemove = async (serviceId: string) => {
    setBusy(true)
    try {
      await unassignServiceFromEmployee(orgId, empId, serviceId)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <select
          className="select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ maxWidth: 360 }}
          disabled={busy || available.length === 0}
        >
          <option value="">
            {available.length === 0
              ? 'Нет доступных услуг'
              : 'Выберите услугу из списка организации…'}
          </option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.durationMinutes} мин
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAdd}
          disabled={!selectedId || busy}
        >
          Добавить
        </button>
      </div>

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Длительность</th>
              <th>Цена</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assigned === null ? (
              <tr>
                <td colSpan={4} style={{ color: 'var(--text-soft)' }}>
                  Загрузка…
                </td>
              </tr>
            ) : assigned.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: 'var(--text-soft)' }}>
                  Услуги не назначены
                </td>
              </tr>
            ) : (
              assigned.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.durationMinutes} мин
                  </td>
                  <td
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.price === null
                      ? '—'
                      : `${s.price.toLocaleString('ru-RU')} ₽`}
                  </td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red-600)' }}
                      onClick={() => onRemove(s.id)}
                      disabled={busy}
                    >
                      <XIcon size={13} />
                      Убрать
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DaysTab({ empId }: { empId: string }) {
  const [days, setDays] = useState<WorkDay[] | null>(null)
  const [form, setForm] = useState({
    workDate: '',
    startTime: '10:00',
    endTime: '20:00',
    breakStart: '',
    breakEnd: '',
  })
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const data = await getWorkDays(empId)
    setDays(data)
  }

  useEffect(() => {
    reload().catch((err) => toast.error(getErrorMessage(err)))
  }, [empId])

  const onAdd = async () => {
    if (!form.workDate || !form.startTime || !form.endTime) {
      toast.error('Заполните дату, начало и конец')
      return
    }
    setBusy(true)
    try {
      await createWorkDay(empId, {
        workDate: form.workDate,
        startTime: form.startTime,
        endTime: form.endTime,
        breakStart: form.breakStart || undefined,
        breakEnd: form.breakEnd || undefined,
      })
      setForm({
        workDate: '',
        startTime: '10:00',
        endTime: '20:00',
        breakStart: '',
        breakEnd: '',
      })
      await reload()
      toast.success('День добавлен')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (workDayId: string) => {
    if (!confirm('Удалить рабочий день?')) return
    setBusy(true)
    try {
      await deleteWorkDay(empId, workDayId)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Начало</th>
              <th>Конец</th>
              <th>Перерыв</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {days === null ? (
              <tr>
                <td colSpan={5} style={{ color: 'var(--text-soft)' }}>
                  Загрузка…
                </td>
              </tr>
            ) : days.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: 'var(--text-soft)' }}>
                  Рабочих дней нет
                </td>
              </tr>
            ) : (
              days.map((d) => (
                <tr key={d.id}>
                  <td
                    style={{
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {d.workDate}
                  </td>
                  <td
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.startTime}
                  </td>
                  <td
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.endTime}
                  </td>
                  <td
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.breakStart && d.breakEnd
                      ? `${d.breakStart}–${d.breakEnd}`
                      : '—'}
                  </td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red-600)' }}
                      onClick={() => onDelete(d.id)}
                      disabled={busy}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: 16,
          background: 'var(--bg-soft)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          + Добавить рабочий день
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr) auto',
            gap: 8,
            alignItems: 'end',
          }}
        >
          <div className="field">
            <label className="field-label">Дата</label>
            <input
              className="input"
              type="date"
              value={form.workDate}
              onChange={(e) =>
                setForm({ ...form, workDate: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">Начало</label>
            <input
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">Конец</label>
            <input
              className="input"
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">Перерыв с</label>
            <input
              className="input"
              type="time"
              value={form.breakStart}
              onChange={(e) =>
                setForm({ ...form, breakStart: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">до</label>
            <input
              className="input"
              type="time"
              value={form.breakEnd}
              onChange={(e) =>
                setForm({ ...form, breakEnd: e.target.value })
              }
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAdd}
            disabled={busy}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
