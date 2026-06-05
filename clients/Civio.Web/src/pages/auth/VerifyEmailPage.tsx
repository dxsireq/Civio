import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { me, resendCode, verifyEmail } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { getErrorMessage } from '../../api/client'

const schema = z.object({
  code: z
    .string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d{6}$/, 'Только цифры'),
})

type FormData = z.infer<typeof schema>

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const email = (location.state as { email?: string } | null)?.email ?? ''

  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [countdown])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const auth = await verifyEmail({ email, code: data.code })
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

      navigate('/', { replace: true })
    } catch (err) {
      localStorage.removeItem('token')
      setSubmitError(getErrorMessage(err))
    }
  }

  const handleResend = async () => {
    setResendError(null)
    setResendSuccess(false)
    try {
      await resendCode({ email })
      setResendSuccess(true)
      setCountdown(60)
    } catch (err) {
      setResendError(getErrorMessage(err))
    }
  }

  return (
    <>
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

      <div className="card" style={{ padding: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          Подтвердите email
        </h1>
        <p
          style={{
            color: 'var(--text-soft)',
            margin: '0 0 22px',
            fontSize: 14,
          }}
        >
          Мы отправили 6-значный код на{' '}
          <strong style={{ color: 'var(--text)' }}>{email}</strong>. Введите его
          ниже.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          noValidate
        >
          <div className="field">
            <label className="field-label" htmlFor="code">
              Код подтверждения <span className="req">*</span>
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className={'input' + (errors.code ? ' has-error' : '')}
              style={{ letterSpacing: '0.25em', fontSize: 20, textAlign: 'center' }}
              {...register('code')}
            />
            {errors.code && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.code.message}
              </div>
            )}
          </div>

          {submitError && (
            <div className="field-error">
              <AlertCircle size={13} />
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: 6 }}
          >
            {isSubmitting ? 'Проверяем…' : 'Подтвердить'}
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
          {resendSuccess && (
            <p style={{ color: 'var(--green-600)', marginBottom: 8 }}>
              Код отправлен повторно.
            </p>
          )}
          {resendError && (
            <p style={{ color: 'var(--danger)', marginBottom: 8 }}>
              {resendError}
            </p>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleResend}
            disabled={countdown > 0}
            style={{ fontSize: 14 }}
          >
            {countdown > 0
              ? `Отправить повторно (${countdown}с)`
              : 'Отправить код повторно'}
          </button>
        </div>
      </div>
    </>
  )
}
