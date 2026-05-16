import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getOrganization,
  updateOrganization,
} from '../../api/organizations'
import { getErrorMessage } from '../../api/client'

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(''))

const schema = z.object({
  name: z.string().min(1, 'Введите название').max(200),
  city: z.string().min(1, 'Введите город').max(100),
  address: z.string().min(1, 'Введите адрес').max(500),
  description: optionalString(1000),
  email: z
    .string()
    .max(256)
    .email('Некорректный email')
    .optional()
    .or(z.literal('')),
  phone: optionalString(20),
  website: z
    .string()
    .max(500)
    .url('Некорректный URL')
    .optional()
    .or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function EditOrgPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getOrganization(id)
      .then((org) => {
        if (cancelled) return
        reset({
          name: org.name,
          city: org.city,
          address: org.address,
          description: org.description ?? '',
          email: org.email ?? '',
          phone: org.phone ?? '',
          website: org.website ?? '',
        })
        setLoaded(true)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id, reset])

  if (!id) return null

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const empty = (v?: string) => (v?.trim() ? v.trim() : undefined)
      await updateOrganization(id, {
        name: data.name.trim(),
        city: data.city.trim(),
        address: data.address.trim(),
        description: empty(data.description),
        email: empty(data.email),
        phone: empty(data.phone),
        website: empty(data.website),
      })
      toast.success('Изменения сохранены')
      navigate(`/organizations/${id}`, { replace: true })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    }
  }

  const fieldClass = (hasError: boolean) =>
    'input' + (hasError ? ' has-error' : '')

  return (
    <div
      className="civio"
      style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}
    >
      <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to={`/organizations/${id}`} className="crumb">
          <ArrowLeft size={14} />
          Назад
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">Редактирование организации</h1>
          </div>
        </div>

        {loadError ? (
          <div className="card" style={{ padding: 24, color: 'var(--red-600)' }}>
            {loadError}
          </div>
        ) : !loaded ? (
          <div className="card" style={{ padding: 24, color: 'var(--text-soft)' }}>
            Загрузка…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="card"
            style={{ padding: 24 }}
            noValidate
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="field-label" htmlFor="name">
                  Название <span className="req">*</span>
                </label>
                <input
                  id="name"
                  className={fieldClass(!!errors.name)}
                  {...register('name')}
                />
                {errors.name && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {errors.name.message}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 12,
                }}
              >
                <div className="field">
                  <label className="field-label" htmlFor="city">
                    Город <span className="req">*</span>
                  </label>
                  <input
                    id="city"
                    className={fieldClass(!!errors.city)}
                    {...register('city')}
                  />
                  {errors.city && (
                    <div className="field-error">
                      <AlertCircle size={13} />
                      {errors.city.message}
                    </div>
                  )}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="address">
                    Адрес <span className="req">*</span>
                  </label>
                  <input
                    id="address"
                    className={fieldClass(!!errors.address)}
                    {...register('address')}
                  />
                  {errors.address && (
                    <div className="field-error">
                      <AlertCircle size={13} />
                      {errors.address.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="description">
                  Описание
                </label>
                <textarea
                  id="description"
                  className={
                    'textarea' + (errors.description ? ' has-error' : '')
                  }
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="field">
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={fieldClass(!!errors.email)}
                    {...register('email')}
                  />
                  {errors.email && (
                    <div className="field-error">
                      <AlertCircle size={13} />
                      {errors.email.message}
                    </div>
                  )}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="phone">
                    Телефон
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={fieldClass(!!errors.phone)}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <div className="field-error">
                      <AlertCircle size={13} />
                      {errors.phone.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="website">
                  Сайт
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  className={fieldClass(!!errors.website)}
                  {...register('website')}
                />
                {errors.website && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {errors.website.message}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {submitError}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <Link to={`/organizations/${id}`} className="btn btn-ghost">
                  Отмена
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
