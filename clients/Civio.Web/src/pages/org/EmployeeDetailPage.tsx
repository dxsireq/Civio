import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, RefreshCw, Trash2, X as XIcon } from 'lucide-react'
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
import { resendInvitation, revokeInvitation } from '../../api/invitations'
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

        {employee.membershipStatus === 'pending' ? (
          <InvitationPanel
            employee={employee}
            orgId={orgId}
            empId={empId}
            onSaved={setEmployee}
            onRevoked={() => navigate(`/organizations/${orgId}/employees`)}
          />
        ) : (
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
        )}
      </div>
    </>
  )
}

function InvitationPanel({
  employee,
  orgId,
  empId,
  onSaved,
  onRevoked,
}: {
  employee: Employee
  orgId: string
  empId: string
  onSaved: (e: Employee) => void
  onRevoked: () => void
}) {
  const [busy, setBusy] = useState(false)

  const onResend = async () => {
    setBusy(true)
    try {
      await resendInvitation(orgId, empId)
      toast.success('Приглашение отправлено повторно')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const onRevoke = async () => {
    if (!confirm('Отозвать приглашение? Сотрудник будет удалён из списка.')) return
    setBusy(true)
    try {
      await revokeInvitation(orgId, empId)
      toast.success('Приглашение отозвано')
      onRevoked()
    } catch (err) {
      toast.error(getErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-soft)',
            color: 'var(--text-soft)',
            flexShrink: 0,
          }}
        >
          <Mail size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Приглашение отправлено</span>
            <span className="badge badge-pending">
              <span className="badge-dot" />
              Ожидает принятия
            </span>
          </div>
          <div
            style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 4 }}
          >
            Письмо отправлено на <b>{employee.email}</b>. Сотрудник получит доступ
            после регистрации и принятия приглашения.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onResend}
          disabled={busy}
        >
          <RefreshCw size={13} />
          Переслать приглашение
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--red-600)' }}
          onClick={onRevoke}
          disabled={busy}
        >
          <Trash2 size={13} />
          Отозвать
        </button>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          Данные сотрудника (предзаполнят форму регистрации)
        </div>
        <DataTab
          employee={employee}
          orgId={orgId}
          empId={empId}
          onSaved={onSaved}
        />
      </div>
    </div>
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
      <div className="grid-2" style={{ gap: 16 }}>
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
        <table className="table table-cards">
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
                  <td data-label="Услуга" style={{ fontWeight: 500 }}>{s.name}</td>
                  <td
                    data-label="Длительность"
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.durationMinutes} мин
                  </td>
                  <td
                    data-label="Цена"
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

const WEEKDAYS = [
  { iso: 1, label: 'Пн' },
  { iso: 2, label: 'Вт' },
  { iso: 3, label: 'Ср' },
  { iso: 4, label: 'Чт' },
  { iso: 5, label: 'Пт' },
  { iso: 6, label: 'Сб' },
  { iso: 7, label: 'Вс' },
]

// Type ЧЧММ -> ЧЧ:ММ, inserting ':' after the 2nd digit automatically.
function formatTimeInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`
}

// Type ддммгггг -> дд/мм/гггг, inserting '/' between groups automatically.
function formatDateInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  let r = d.slice(0, 2)
  if (d.length > 2) r += '/' + d.slice(2, 4)
  if (d.length > 4) r += '/' + d.slice(4, 8)
  return r
}

// дд/мм/гггг -> гггг-мм-дд (ISO). Empty string if not a complete valid format.
function ddmmyyyyToIso(s: string): string {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

// гггг-мм-дд -> дд/мм/гггг for display. Returns input unchanged if not ISO.
function isoToDdmmyyyy(s: string): string {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s
}

function generateDates(selectedDays: number[], untilDate: string): string[] {
  const result: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(untilDate)
  until.setHours(0, 0, 0, 0)
  const cur = new Date(today)
  while (cur <= until) {
    const iso = cur.getDay() === 0 ? 7 : cur.getDay()
    if (selectedDays.includes(iso)) {
      // Format from local parts — toISOString() shifts to UTC and can roll the
      // weekday back a day in positive-offset timezones (Mon -> Sun).
      const y = cur.getFullYear()
      const m = String(cur.getMonth() + 1).padStart(2, '0')
      const day = String(cur.getDate()).padStart(2, '0')
      result.push(`${y}-${m}-${day}`)
    }
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function DaysTab({ empId }: { empId: string }) {
  const [days, setDays] = useState<WorkDay[] | null>(null)
  const [form, setForm] = useState({
    selectedDays: [] as number[],
    untilDate: '',
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

  const toggleDay = (iso: number) => {
    setForm((f) => ({
      ...f,
      selectedDays: f.selectedDays.includes(iso)
        ? f.selectedDays.filter((d) => d !== iso)
        : [...f.selectedDays, iso],
    }))
  }

  const onAdd = async () => {
    if (form.selectedDays.length === 0) {
      toast.error('Выберите хотя бы один день недели')
      return
    }
    if (!form.untilDate) {
      toast.error('Укажите дату окончания')
      return
    }
    const untilIso = ddmmyyyyToIso(form.untilDate)
    if (!untilIso) {
      toast.error('Дата окончания в формате дд/мм/гггг')
      return
    }
    const until = new Date(untilIso)
    until.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (until < today) {
      toast.error('Дата окончания должна быть не раньше сегодня')
      return
    }
    if (!form.startTime || !form.endTime) {
      toast.error('Заполните начало и конец рабочего дня')
      return
    }
    if (form.startTime >= form.endTime) {
      toast.error('Начало рабочего дня должно быть раньше конца')
      return
    }
    if (form.breakStart || form.breakEnd) {
      if (!form.breakStart || !form.breakEnd) {
        toast.error('Заполните оба поля перерыва')
        return
      }
      if (form.breakStart >= form.breakEnd) {
        toast.error('Начало перерыва должно быть раньше конца')
        return
      }
      if (form.breakStart < form.startTime || form.breakEnd > form.endTime) {
        toast.error('Перерыв должен быть в пределах рабочего времени')
        return
      }
    }
    const dates = generateDates(form.selectedDays, untilIso)
    if (dates.length === 0) {
      toast.error('Нет подходящих дат в указанном периоде')
      return
    }
    setBusy(true)
    try {
      const results = await Promise.allSettled(
        dates.map((d) =>
          createWorkDay(empId, {
            workDate: d,
            startTime: form.startTime,
            endTime: form.endTime,
            breakStart: form.breakStart || undefined,
            breakEnd: form.breakEnd || undefined,
          }),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      const added = results.length - failed
      await reload()
      if (failed === 0) {
        toast.success(`Добавлено ${added} дн.`)
      } else {
        toast.success(`Добавлено ${added} дн., не удалось: ${failed}`)
      }
      setForm((f) => ({ ...f, selectedDays: [], untilDate: '' }))
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
          padding: 16,
          background: 'var(--bg-soft)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--r-lg)',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          + Добавить рабочие дни
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Дни недели</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {WEEKDAYS.map(({ iso, label }) => (
                <button
                  key={iso}
                  type="button"
                  onClick={() => toggleDay(iso)}
                  style={{
                    width: 36,
                    height: 34,
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: form.selectedDays.includes(iso)
                      ? 'var(--accent)'
                      : 'var(--bg)',
                    color: form.selectedDays.includes(iso)
                      ? '#fff'
                      : 'var(--text)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">До даты</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              placeholder="дд/мм/гггг"
              maxLength={10}
              value={form.untilDate}
              onChange={(e) =>
                setForm({ ...form, untilDate: formatDateInput(e.target.value) })
              }
              style={{ width: 150 }}
            />
          </div>
        </div>

        <div className="grid-form-row">
          <div className="field">
            <label className="field-label">Начало</label>
            <input
              className="input"
              type="text"
              placeholder="ЧЧ:ММ"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              inputMode="numeric"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: formatTimeInput(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">Конец</label>
            <input
              className="input"
              type="text"
              placeholder="ЧЧ:ММ"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              inputMode="numeric"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: formatTimeInput(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">Перерыв с</label>
            <input
              className="input"
              type="text"
              placeholder="ЧЧ:ММ"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              inputMode="numeric"
              value={form.breakStart}
              onChange={(e) =>
                setForm({ ...form, breakStart: formatTimeInput(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label className="field-label">до</label>
            <input
              className="input"
              type="text"
              placeholder="ЧЧ:ММ"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              inputMode="numeric"
              value={form.breakEnd}
              onChange={(e) =>
                setForm({ ...form, breakEnd: formatTimeInput(e.target.value) })
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

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}
      >
        <table className="table table-cards">
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
                    data-label="Дата"
                    style={{
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {isoToDdmmyyyy(d.workDate)}
                  </td>
                  <td
                    data-label="Начало"
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.startTime}
                  </td>
                  <td
                    data-label="Конец"
                    className="cell-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.endTime}
                  </td>
                  <td
                    data-label="Перерыв"
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
    </div>
  )
}
