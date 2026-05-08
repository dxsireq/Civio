import { useEffect, useRef, useState } from 'react'
import { Camera, Check, QrCode, RotateCw, X as XIcon } from 'lucide-react'
import jsQR from 'jsqr'
import {
  scanBookingQr,
  type ScanQrResponse,
} from '../../api/bookings'
import { getErrorMessage } from '../../api/client'

type State =
  | { kind: 'scanning' }
  | { kind: 'success'; result: ScanQrResponse }
  | { kind: 'error'; message: string }

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startIso} — ${endIso}`
  }
  const date = start.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const fmt = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${fmt(start)} – ${fmt(end)}`
}

export function ScannerPage() {
  const [state, setState] = useState<State>({ kind: 'scanning' })
  const [manualOpen, setManualOpen] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const scannedRef = useRef(false)

  const stop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const submitToken = async (token: string) => {
    if (scannedRef.current) return
    scannedRef.current = true
    stop()
    setSubmitting(true)
    try {
      const result = await scanBookingQr(token)
      setState({ kind: 'success', result })
    } catch (err) {
      setState({ kind: 'error', message: getErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (state.kind !== 'scanning') return
    scannedRef.current = false
    let cancelled = false

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const tick = () => {
          if (cancelled || scannedRef.current) return
          if (
            video.readyState === video.HAVE_ENOUGH_DATA &&
            video.videoWidth > 0
          ) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(img.data, img.width, img.height, {
              inversionAttempts: 'dontInvert',
            })
            if (code?.data) {
              submitToken(code.data)
              return
            }
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message:
              err instanceof Error
                ? `Не удалось запустить камеру: ${err.message}`
                : 'Не удалось запустить камеру',
          })
        }
      }
    }

    start()

    return () => {
      cancelled = true
      stop()
    }
  }, [state.kind])

  useEffect(() => () => stop(), [])

  const restart = () => setState({ kind: 'scanning' })

  const onManualSubmit = async () => {
    const token = manualToken.trim()
    if (!token) return
    setManualOpen(false)
    setManualToken('')
    await submitToken(token)
  }

  return (
    <>
      <div className="topbar">
        <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Сканер QR</div>
      </div>

      <div
        className="page"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ marginBottom: 22 }}>
            <h1 className="page-title">Сканер QR</h1>
            <div className="page-subtitle">
              {state.kind === 'scanning'
                ? 'Подтверждение визита по QR-коду из приложения клиента'
                : 'Результат сканирования'}
            </div>
          </div>

          {state.kind === 'scanning' && (
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  background: '#0f172a',
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,.85)',
                    fontSize: 13,
                  }}
                >
                  {submitting
                    ? 'Проверяем код…'
                    : 'Наведите камеру на QR-код клиента'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={restart}
                >
                  <Camera size={14} />
                  Перезапустить
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setManualOpen(true)}
                >
                  Ввести код вручную
                </button>
              </div>
            </div>
          )}

          {state.kind === 'success' && (
            <SuccessCard result={state.result} onAgain={restart} />
          )}

          {state.kind === 'error' && (
            <ErrorCard message={state.message} onAgain={restart} />
          )}
        </div>
      </div>

      {manualOpen && (
        <div
          className="modal-overlay"
          onClick={() => setManualOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 'var(--r-lg)',
              width: '100%',
              maxWidth: 420,
            }}
          >
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              Ввод токена вручную
            </h2>
            <textarea
              className="textarea"
              rows={3}
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Вставьте токен QR-кода"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setManualOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onManualSubmit}
                disabled={!manualToken.trim()}
              >
                Проверить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SuccessCard({
  result,
  onAgain,
}: {
  result: ScanQrResponse
  onAgain: () => void
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '36px 28px 28px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #ecfdf5 0%, white 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: '#10b981',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(16, 185, 129, .35)',
          }}
        >
          <Check size={36} strokeWidth={2.5} />
        </div>
        <h2
          style={{
            margin: '0 0 6px',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Визит подтверждён
        </h2>
        <div style={{ color: 'var(--text-soft)', fontSize: 14 }}>
          Клиент отмечен как пришедший
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <dl
          className="kv"
          style={{ marginTop: 0, gridTemplateColumns: '110px 1fr' }}
        >
          <dt>Клиент</dt>
          <dd style={{ fontWeight: 500 }}>
            {result.citizenFirstName} {result.citizenLastName}
          </dd>
          <dt>Услуга</dt>
          <dd style={{ fontWeight: 500 }}>{result.serviceName}</dd>
          <dt>Время</dt>
          <dd
            style={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
            }}
          >
            {formatRange(result.startAt, result.endAt)}
          </dd>
          <dt>Статус</dt>
          <dd>{result.statusName}</dd>
        </dl>

        <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onAgain}
          >
            <QrCode size={15} />
            Сканировать следующий
          </button>
        </div>
      </div>
    </div>
  )
}

function ErrorCard({
  message,
  onAgain,
}: {
  message: string
  onAgain: () => void
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '36px 28px 28px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #fef2f2 0%, white 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: '#ef4444',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(239, 68, 68, .35)',
          }}
        >
          <XIcon size={36} strokeWidth={2.5} />
        </div>
        <h2
          style={{
            margin: '0 0 6px',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Не удалось подтвердить
        </h2>
        <div
          style={{
            color: 'var(--text-soft)',
            fontSize: 14,
            maxWidth: 380,
            margin: '0 auto',
          }}
        >
          {message}
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onAgain}
        >
          <RotateCw size={15} />
          Попробовать снова
        </button>
      </div>
    </div>
  )
}
