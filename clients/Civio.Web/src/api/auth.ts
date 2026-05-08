import { api } from './client'

export interface AuthResponse {
  userId: string
  email: string
  firstName: string
  lastName: string
  accessToken: string
}

export interface CurrentUserResponse {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/register', data)
  return res.data
}

export async function me(): Promise<CurrentUserResponse> {
  const res = await api.get<CurrentUserResponse>('/api/auth/me')
  return res.data
}
