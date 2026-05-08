import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Pencil, Plus, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createService,
  deactivateService,
  getServices,
  updateService,
  type CreateServiceRequest,
  type Service,
} from '../../api/services'
import { getErrorMessage } from '../../api/client'

interface FormState {
  name: string
  description: string
  durationMinutes: string
  price: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  durationMinutes: '60',
  price: '',
}

export function ServicesPage() {
  const { id: orgId } = useParams<{ id: string }>()
  const [services, setServices] = useState<Service[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    getServices(orgId)
      .then((data) => {
        if (!cancelled) setServices(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [orgId])

  if (!orgId) return null

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      description: s.description ?? '',
      durationMinutes: String(s.durationMinutes),
      price: s.price === null ? '' : String(s.price),
    })
    setDrawerOpen(true)
  }

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error('Введите название')
      return
    }
    const duration = Number(form.durationMinutes)
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error('Длительность должна быть положительным числом минут')
      return
    }
    const priceTrimmed = form.price.trim()
    let price: number | undefined
    if (priceTrimmed) {
      const p = Number(priceTrimmed)
      if (!Number.isFinite(p) || p < 0) {
        toast.error('Цена должна быть неотрицательным числом')
        return
      }
      price = p
    }

    const payload: CreateServiceRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      durationMinutes: duration,
      price,
    }

    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateService(orgId, editingId, payload)
        setServices((prev) =>
          prev?.map((s) => (s.id === editingId ? updated : s)) ?? prev,
        )
        toast.success('Услуга обновлена')
      } else {
        const created = await createService(orgId, payload)
        setServices((prev) => (prev ? [...prev, created] : [created]))
        toast.success('Услуга создана')
      }
      setDrawerOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const onDeactivate = async (s: Service) => {
    if (!confirm(`Деактивировать «${s.name}»?`)) return
    try {
      await deactivateService(orgId, s.id)
      setServices(
        (prev) =>
          prev?.map((x) =>
            x.id === s.id ? { ...x, isActive: false } : x,
          ) ?? prev,
      )
      toast.success('Услуга деактивирована')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <div className="topbar">
        <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Услуги</div>
      </div>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Услуги</h1>
            <div className="page-subtitle">
              {services
                ? `${services.length} в каталоге · ${services.filter((s) => s.isActive).length} активных`
                : 'Загрузка…'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            <Plus size={14} />
            Добавить услугу
          </button>
        </div>

        {error ? (
          <div
            className="card"
            style={{ padding: 24, color: 'var(--red-600)' }}
          >
            {error}
          </div>
        ) : services === null ? (
          <div
            className="card"
            style={{ padding: 24, color: 'var(--text-soft)' }}
          >
            Загрузка…
          </div>
        ) : services.length === 0 ? (
          <div className="card empty-state" style={{ padding: 32 }}>
            Услуг пока нет — добавьте первую
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Длительность</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th className="cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.55 }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      {s.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            maxWidth: 360,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td
                      className="cell-muted"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {s.durationMinutes} мин
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.price === null
                        ? '—'
                        : `${s.price.toLocaleString('ru-RU')} ₽`}
                    </td>
                    <td>
                      {s.isActive ? (
                        <span className="badge badge-approved">
                          <span className="badge-dot" />
                          Активна
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          <span className="badge-dot" />
                          Неактивна
                        </span>
                      )}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil size={13} />
                      </button>
                      {s.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => onDeactivate(s)}
                        >
                          Деактивировать
                        </button>
                      )}
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
              <h2 className="card-title">
                {editingId ? 'Редактирование услуги' : 'Новая услуга'}
              </h2>
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
                  Название <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">Описание</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="field">
                  <label className="field-label">
                    Длительность (мин) <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm({ ...form, durationMinutes: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label className="field-label">Цена, ₽</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
              </div>

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
                  disabled={saving}
                >
                  Отмена
                </button>
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
          </div>
        </div>
      )}
    </>
  )
}
