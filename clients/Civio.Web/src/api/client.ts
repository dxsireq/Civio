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

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      return 'Нет соединения с сервером'
    }
    const data = error.response.data
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
    return data?.error ?? data?.detail ?? data?.title ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Неизвестная ошибка'
}
