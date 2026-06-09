import axios, { type AxiosError, type AxiosInstance } from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface ApiErrorPayload {
  error?: string
  title?: string
  detail?: string
  errors?: Record<string, string[]>
  code?: string
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status

    if (status === 401) {
      const url = error.config?.url ?? ''
      const isAuthEndpoint =
        url.includes('/api/auth/login') || url.includes('/api/auth/register')
      if (!isAuthEndpoint) {
        useAuthStore.getState().logout()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }

    if (status === undefined || status >= 500) {
      toast.error(getErrorMessage(error))
    }

    return Promise.reject(error)
  },
)

export function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.code ?? null
  }
  return null
}

const codeMessages: Record<string, string> = {
  invalid_credentials: 'Неверный email или пароль',
  user_inactive: 'Аккаунт деактивирован. Обратитесь к администратору',
}

const statusMessages: Record<number, string> = {
  400: 'Некорректный запрос',
  401: 'Необходима авторизация',
  403: 'Доступ запрещён',
  404: 'Ресурс не найден',
  409: 'Конфликт данных',
  422: 'Некорректные данные',
  429: 'Слишком много запросов',
  500: 'Внутренняя ошибка сервера',
  502: 'Сервер недоступен',
  503: 'Сервис временно недоступен',
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      return 'Нет соединения с сервером'
    }
    const { status, data } = error.response
    if (data?.code && codeMessages[data.code]) {
      return codeMessages[data.code]
    }
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
    if (typeof data?.error === 'string' && data.error) return data.error
    if (typeof data?.detail === 'string' && data.detail) return data.detail
    if (typeof data?.title === 'string' && data.title) return data.title
    return statusMessages[status] ?? 'Неизвестная ошибка'
  }
  if (error instanceof Error) return error.message
  return 'Неизвестная ошибка'
}
