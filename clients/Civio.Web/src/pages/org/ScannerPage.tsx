import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  Clipboard as ClipboardIcon,
  ImageIcon,
  QrCode,
  RotateCw,
  X as XIcon,
} from 'lucide-react'
import jsQR from 'jsqr'
import {
  scanBookingQr,
  type ScanQrResponse,
} from '../../api/bookings'
import { getErrorMessage } from '../../api/client'
import { TopbarLeft } from '../../components/Topbar'

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
    timeZone: 'UTC',
  })
  const fmt = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  return `${date} · ${fmt(start)} – ${fmt(end)}`
}

export function ScannerPage() {
  const [state, setState] = useState<State>({ kind: 'scanning' })
  const [manualOpen, setManualOpen] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile()
          if (blob) {
            e.preventDefault()
            void decodeBlob(blob)
          }
          return
        }
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restart = () => setState({ kind: 'scanning' })

  const decodeBlob = async (blob: Blob) => {
    scannedRef.current = false
    const url = URL.createObjectURL(blob)
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
        img.src = url
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Canvas context unavailable')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      if (!code?.data) {
        setState({ kind: 'error', message: 'QR-код не найден в изображении' })
        return
      }
      await submitToken(code.data)
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Ошибка при чтении файла',
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await decodeBlob(file)
  }

  const pasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        setState({
          kind: 'error',
          message:
            'Браузер не поддерживает чтение буфера обмена. Скопируйте картинку и нажмите Ctrl+V, либо загрузите из файла.',
        })
        return
      }
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'))
        if (type) {
          const blob = await item.getType(type)
          await decodeBlob(blob)
          return
        }
      }
      setState({
        kind: 'error',
        message: 'В буфере обмена нет изображения',
      })
    } catch (err) {
      setState({
        kind: 'error',
        message:
          err instanceof Error
            ? `Не удалось прочитать буфер обмена: ${err.message}`
            : 'Не удалось прочитать буфер обмена',
      })
    }
  }

  const onManualSubmit = async () => {
    const token = manualToken.trim()
    if (!token) return
    setManualOpen(false)
    setManualToken('')
    await submitToken(token)
  }

  return (
    <>
      <TopbarLeft>Сканер QR</TopbarLeft>

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
                  flexWrap: 'wrap',
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={14} />
                    Из файла
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={pasteFromClipboard}
                  >
                    <ClipboardIcon size={14} />
                    Из буфера
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setManualOpen(true)}
                  >
                    Ввести вручную
                  </button>
                </div>
              </div>
            </div>
          )}

          {state.kind === 'success' && (
            <SuccessCard result={state.result} onAgain={restart} />
          )}

          {state.kind === 'error' && (
            <ErrorCard
              message={state.message}
              onAgain={restart}
              onFromFile={() => fileInputRef.current?.click()}
              onFromClipboard={pasteFromClipboard}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
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
  onFromFile,
  onFromClipboard,
}: {
  message: string
  onAgain: () => void
  onFromFile?: () => void
  onFromClipboard?: () => void
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
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onAgain}
        >
          <RotateCw size={15} />
          Попробовать снова
        </button>
        {onFromFile && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={onFromFile}
          >
            <ImageIcon size={15} />
            Загрузить из файла
          </button>
        )}
        {onFromClipboard && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={onFromClipboard}
          >
            <ClipboardIcon size={15} />
            Вставить из буфера
          </button>
        )}
      </div>
    </div>
  )
}
