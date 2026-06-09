import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import {
  acceptInvitation,
  acceptInvitationWithRegistration,
  getInvitation,
  type InvitationInfo,
} from '../../api/invitations'
import { me } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { getErrorMessage } from '../../api/client'

const schema = z
  .object({
    firstName: z.string().min(1, 'Введите имя').max(100, 'Не более 100 символов'),
    lastName: z
      .string()
      .min(1, 'Введите фамилию')
      .max(100, 'Не более 100 символов'),
    middleName: z.string().max(100).optional().or(z.literal('')),
    phone: z.string().max(20, 'Не более 20 символов').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(100, 'Не более 100 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

type FormData = z.infer<typeof schema>

function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <span className="civio-logo" style={{ fontSize: 22 }}>
        <span
          className="civio-logo-mark"
          style={{ width: 30, height: 30, fontSize: 15 }}
        >
          C
        </span>
        Civio
      </span>
    </div>
  )
}

const INVALID_REASON: Record<string, string> = {
  expired: 'Срок действия приглашения истёк.',
  revoked: 'Приглашение было отозвано.',
  accepted: 'Приглашение уже принято.',
}

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const authToken = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getInvitation(token)
      .then((data) => {
        if (!cancelled) setInvitation(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) return null

  if (loading) {
    return (
      <>
        <Logo />
        <div className="card" style={{ padding: 32, color: 'var(--text-soft)' }}>
          Загрузка…
        </div>
      </>
    )
  }

  if (loadError || !invitation) {
    return (
      <>
        <Logo />
        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
            Приглашение не найдено
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 20px' }}>
            {loadError ?? 'Ссылка недействительна.'}
          </p>
          <Link to="/login" className="btn btn-primary btn-block">
            На страницу входа
          </Link>
        </div>
      </>
    )
  }

  if (invitation.status !== 'pending') {
    return (
      <>
        <Logo />
        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
            Приглашение недействительно
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 20px' }}>
            {INVALID_REASON[invitation.status] ?? 'Приглашение недоступно.'}
          </p>
          <Link to="/login" className="btn btn-primary btn-block">
            На страницу входа
          </Link>
        </div>
      </>
    )
  }

  if (invitation.userExists) {
    return (
      <ExistingUserAccept
        token={token}
        invitation={invitation}
        authToken={authToken}
        userEmail={user?.email ?? null}
        navigate={navigate}
        logout={logout}
      />
    )
  }

  return (
    <RegisterAndAccept
      token={token}
      invitation={invitation}
      onAuthed={(accessToken, current) => {
        setAuth(accessToken, {
          id: current.userId,
          email: current.email,
          firstName: current.firstName,
          lastName: current.lastName,
          middleName: current.middleName,
          phone: current.phone,
          roles: current.roles,
        })
        navigate('/', { replace: true })
      }}
    />
  )
}

function ExistingUserAccept({
  token,
  invitation,
  authToken,
  userEmail,
  navigate,
  logout,
}: {
  token: string
  invitation: InvitationInfo
  authToken: string | null
  userEmail: string | null
  navigate: ReturnType<typeof useNavigate>
  logout: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goLogin = () =>
    navigate('/login', {
      state: { from: { pathname: `/invite/${token}` } },
    })

  // Not logged in
  if (!authToken) {
    return (
      <>
        <Logo />
        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>
            Приглашение в «{invitation.organizationName}»
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 20px' }}>
            У вас уже есть аккаунт с почтой <b>{invitation.email}</b>. Войдите,
            чтобы принять приглашение.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={goLogin}>
            Войти и принять
          </button>
        </div>
      </>
    )
  }

  // Logged in, email mismatch
  if (userEmail && userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <>
        <Logo />
        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>
            Другой аккаунт
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 20px' }}>
            Приглашение отправлено на <b>{invitation.email}</b>, а вы вошли как{' '}
            <b>{userEmail}</b>. Войдите под нужной почтой.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              logout()
              goLogin()
            }}
          >
            Сменить аккаунт
          </button>
        </div>
      </>
    )
  }

  // Logged in, email matches
  const onAccept = async () => {
    setError(null)
    setBusy(true)
    try {
      await acceptInvitation(token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Logo />
      <div className="card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>
          Приглашение в «{invitation.organizationName}»
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 20px' }}>
          Вы вошли как <b>{invitation.email}</b>. Примите приглашение, чтобы начать
          работу.
        </p>
        {error && (
          <div className="field-error" style={{ marginBottom: 12 }}>
            <AlertCircle size={13} />
            {error}
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onAccept}
          disabled={busy}
        >
          {busy ? 'Принимаем…' : 'Принять приглашение'}
        </button>
      </div>
    </>
  )
}

function RegisterAndAccept({
  token,
  invitation,
  onAuthed,
}: {
  token: string
  invitation: InvitationInfo
  onAuthed: (
    accessToken: string,
    current: Awaited<ReturnType<typeof me>>,
  ) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      middleName: invitation.middleName ?? '',
      phone: invitation.phone ?? '',
      password: '',
      confirmPassword: '',
    },
  })

  const phonePrevRef = useRef('')

  const formatPhone = (digits: string): string => {
    if (!digits) return ''
    const a = digits[0]
    const b = digits.slice(1, 4)
    const c = digits.slice(4, 7)
    const d = digits.slice(7, 9)
    const e = digits.slice(9, 11)
    let out = '+' + a
    if (b) out += ' (' + b
    if (b.length === 3) out += ')'
    if (c) out += ' ' + c
    if (d) out += '-' + d
    if (e) out += '-' + e
    return out
  }

  const phoneReg = register('phone')

  const handlePhoneChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
    const prev = phonePrevRef.current
    const raw = ev.target.value
    let digits = raw.replace(/\D/g, '')
    const prevDigits = prev.replace(/\D/g, '')
    if (raw.length < prev.length && digits === prevDigits && digits.length > 0) {
      digits = digits.slice(0, -1)
    }
    if (digits[0] === '8') digits = '7' + digits.slice(1)
    digits = digits.slice(0, 11)
    const formatted = formatPhone(digits)
    ev.target.value = formatted
    phonePrevRef.current = formatted
    void phoneReg.onChange(ev)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const trim = (v?: string) => (v?.trim() ? v.trim() : undefined)
      const auth = await acceptInvitationWithRegistration(token, {
        password: data.password,
        firstName: trim(data.firstName),
        lastName: trim(data.lastName),
        middleName: trim(data.middleName),
        phone: trim(data.phone),
      })
      localStorage.setItem('token', auth.accessToken)
      const current = await me()
      onAuthed(auth.accessToken, current)
    } catch (err) {
      localStorage.removeItem('token')
      setSubmitError(getErrorMessage(err))
    }
  }

  const fieldClass = (hasError: boolean) => 'input' + (hasError ? ' has-error' : '')

  return (
    <>
      <Logo />
      <div className="card" style={{ padding: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          Регистрация сотрудника
        </h1>
        <p style={{ color: 'var(--text-soft)', margin: '0 0 22px', fontSize: 14 }}>
          Вас пригласили в «{invitation.organizationName}». Задайте пароль, чтобы
          завершить регистрацию.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          noValidate
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="firstName">
                Имя <span className="req">*</span>
              </label>
              <input
                id="firstName"
                className={fieldClass(!!errors.firstName)}
                {...register('firstName')}
              />
              {errors.firstName && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="lastName">
                Фамилия <span className="req">*</span>
              </label>
              <input
                id="lastName"
                className={fieldClass(!!errors.lastName)}
                {...register('lastName')}
              />
              {errors.lastName && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {errors.lastName.message}
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
              className={fieldClass(!!errors.middleName)}
              {...register('middleName')}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" value={invitation.email} disabled />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">
              Телефон
            </label>
            <input
              id="phone"
              type="tel"
              className={fieldClass(!!errors.phone)}
              {...phoneReg}
              onChange={handlePhoneChange}
            />
            {errors.phone && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.phone.message}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Пароль <span className="req">*</span>
            </label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={fieldClass(!!errors.password)}
                {...register('password')}
              />
              <button
                className="input-group-action"
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password ? (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.password.message}
              </div>
            ) : (
              <div className="field-help">Минимум 8 символов</div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirmPassword">
              Подтвердить пароль <span className="req">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={fieldClass(!!errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          {submitError && (
            <div className="form-alert" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: 6 }}
          >
            {isSubmitting ? 'Создаём…' : 'Зарегистрироваться и принять'}
          </button>
        </form>
      </div>
    </>
  )
}
