import { create } from 'zustand'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: loadUser(),

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  isAuthenticated: () => get().token !== null,
  isAdmin: () => get().user?.roles.includes('PlatformAdmin') ?? false,
}))
