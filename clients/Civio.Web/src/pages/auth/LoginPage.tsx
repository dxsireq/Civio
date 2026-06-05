import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { login, me, resendCode } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { getErrorCode, getErrorMessage } from '../../api/client'

const schema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const auth = await login(data)
      localStorage.setItem('token', auth.accessToken)

      const current = await me()
      setAuth(auth.accessToken, {
        id: current.userId,
        email: current.email,
        firstName: current.firstName,
        lastName: current.lastName,
        middleName: current.middleName,
        phone: current.phone,
        roles: current.roles,
      })

      const isAdmin = current.roles.includes('PlatformAdmin')
      const fallback = isAdmin ? '/admin/organizations' : '/'
      const from = (location.state as { from?: Location } | null)?.from
      navigate(from?.pathname ?? fallback, { replace: true })
    } catch (err) {
      localStorage.removeItem('token')
      if (getErrorCode(err) === 'email_not_verified') {
        // Silently kick off a resend, then redirect to verify screen
        try { await resendCode({ email: data.email.trim().toLowerCase() }) } catch { /* ignore */ }
        navigate('/register/verify', { state: { email: data.email.trim().toLowerCase() } })
        return
      }
      setSubmitError(getErrorMessage(err))
    }
  }

  const emailError = errors.email?.message ?? null
  const passwordError = errors.password?.message ?? null
  const formError = submitError

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
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

      <div className="card" style={{ padding: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          Войти в систему
        </h1>
        <p
          style={{
            color: 'var(--text-soft)',
            margin: '0 0 24px',
            fontSize: 14,
          }}
        >
          Управляйте организацией и записями
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          noValidate
        >
          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={'input' + (emailError || formError ? ' has-error' : '')}
              {...register('email')}
            />
            {emailError && (
              <div className="field-error">
                <AlertCircle size={13} />
                {emailError}
              </div>
            )}
            {formError && !emailError && (
              <div className="field-error">
                <AlertCircle size={13} />
                {formError}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Пароль
            </label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={'input' + (passwordError ? ' has-error' : '')}
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
            {passwordError && (
              <div className="field-error">
                <AlertCircle size={13} />
                {passwordError}
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: 13,
                  color: 'var(--indigo-700)',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Забыли пароль?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: 4 }}
          >
            {isSubmitting ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 14,
            color: 'var(--text-soft)',
          }}
        >
          Нет аккаунта?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--indigo-700)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>

      <p
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 24,
        }}
      >
        © 2026 Civio · Платформа онлайн-записи
      </p>
    </>
  )
}
