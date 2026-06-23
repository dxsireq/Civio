import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { changePassword, updateProfile } from '../../api/auth'
import { getErrorMessage } from '../../api/client'
import { useAuthStore } from '../../store/auth'

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(''))

const profileSchema = z.object({
  firstName: z.string().min(1, 'Введите имя').max(100),
  lastName: z.string().min(1, 'Введите фамилию').max(100),
  middleName: optionalString(100),
  phone: optionalString(20),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(100, 'Максимум 100 символов'),
    confirmPassword: z.string().min(1, 'Повторите новый пароль'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      middleName: user?.middleName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const empty = (v?: string) => (v?.trim() ? v.trim() : undefined)

  const onSaveProfile = async (data: ProfileFormData) => {
    setProfileError(null)
    try {
      const updated = await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        middleName: empty(data.middleName),
        phone: empty(data.phone),
      })
      setUser({
        id: updated.userId,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        middleName: updated.middleName,
        phone: updated.phone,
        roles: updated.roles,
      })
      toast.success('Профиль обновлён')
    } catch (err) {
      setProfileError(getErrorMessage(err))
    }
  }

  const onChangePassword = async (data: PasswordFormData) => {
    setPasswordError(null)
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success('Пароль изменён')
    } catch (err) {
      setPasswordError(getErrorMessage(err))
    }
  }

  const fieldClass = (hasError: boolean) =>
    'input' + (hasError ? ' has-error' : '')

  const profileErrors = profileForm.formState.errors
  const passwordErrors = passwordForm.formState.errors

  return (
    <div
      className="civio"
      style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}
    >
      <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) navigate(-1)
            else navigate('/', { replace: true })
          }}
          className="crumb"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Профиль</h1>
            <div className="page-subtitle">
              Личные данные и параметры безопасности
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={15} />
            Выйти
          </button>
        </div>

        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="card"
          style={{ padding: 24, marginBottom: 18 }}
          noValidate
        >
          <div className="card-header" style={{ marginBottom: 16, padding: 0 }}>
            <h2 className="card-title">Личные данные</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                className="input"
                value={user.email}
                disabled
                readOnly
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
                <label className="field-label" htmlFor="lastName">
                  Фамилия <span className="req">*</span>
                </label>
                <input
                  id="lastName"
                  className={fieldClass(!!profileErrors.lastName)}
                  {...profileForm.register('lastName')}
                />
                {profileErrors.lastName && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {profileErrors.lastName.message}
                  </div>
                )}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="firstName">
                  Имя <span className="req">*</span>
                </label>
                <input
                  id="firstName"
                  className={fieldClass(!!profileErrors.firstName)}
                  {...profileForm.register('firstName')}
                />
                {profileErrors.firstName && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {profileErrors.firstName.message}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="middleName">
                Отчество
              </label>
              <input
                id="middleName"
                className={fieldClass(!!profileErrors.middleName)}
                {...profileForm.register('middleName')}
              />
              {profileErrors.middleName && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {profileErrors.middleName.message}
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
                className={fieldClass(!!profileErrors.phone)}
                {...profileForm.register('phone')}
              />
              {profileErrors.phone && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {profileErrors.phone.message}
                </div>
              )}
            </div>

            {profileError && (
              <div className="field-error">
                <AlertCircle size={13} />
                {profileError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 6,
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting
                  ? 'Сохраняем…'
                  : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="card"
          style={{ padding: 24 }}
          noValidate
        >
          <div className="card-header" style={{ marginBottom: 16, padding: 0 }}>
            <h2 className="card-title">Безопасность</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label className="field-label" htmlFor="currentPassword">
                Текущий пароль <span className="req">*</span>
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={fieldClass(!!passwordErrors.currentPassword)}
                {...passwordForm.register('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {passwordErrors.currentPassword.message}
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
                <label className="field-label" htmlFor="newPassword">
                  Новый пароль <span className="req">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className={fieldClass(!!passwordErrors.newPassword)}
                  {...passwordForm.register('newPassword')}
                />
                {passwordErrors.newPassword && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {passwordErrors.newPassword.message}
                  </div>
                )}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="confirmPassword">
                  Повторите пароль <span className="req">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={fieldClass(!!passwordErrors.confirmPassword)}
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <div className="field-error">
                    <AlertCircle size={13} />
                    {passwordErrors.confirmPassword.message}
                  </div>
                )}
              </div>
            </div>

            {passwordError && (
              <div className="field-error">
                <AlertCircle size={13} />
                {passwordError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 6,
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting
                  ? 'Сохраняем…'
                  : 'Сменить пароль'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
