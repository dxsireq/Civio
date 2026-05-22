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
  middleName: string | null
  phone: string | null
  roles: string[]
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  middleName?: string
  phone?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
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

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<CurrentUserResponse> {
  const res = await api.put<CurrentUserResponse>('/api/auth/me', data)
  return res.data
}

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await api.post('/api/auth/me/change-password', data)
}
