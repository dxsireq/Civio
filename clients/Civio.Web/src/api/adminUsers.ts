import { api } from './client'

export type UserRole = 'Citizen' | 'OrganizationEmployee' | 'PlatformAdmin'

export const ALL_ROLES: UserRole[] = [
  'Citizen',
  'OrganizationEmployee',
  'PlatformAdmin',
]

export interface AdminUserListItem {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  roles: string[]
  createdAt: string
}

export interface AdminUserOwnedOrg {
  id: string
  name: string
  status: string
}

export interface AdminUserDetail {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  phone: string | null
  isActive: boolean
  roles: string[]
  ownedOrganizations: AdminUserOwnedOrg[]
  createdAt: string
  updatedAt: string | null
}

export interface AdminUsersQuery {
  search?: string
  role?: UserRole
  isActive?: boolean
}

export async function getAllUsers(
  query: AdminUsersQuery = {},
): Promise<AdminUserListItem[]> {
  const params: Record<string, string> = {}
  if (query.search) params.search = query.search
  if (query.role) params.role = query.role
  if (typeof query.isActive === 'boolean') params.isActive = String(query.isActive)
  const res = await api.get<AdminUserListItem[]>('/api/admin/users', { params })
  return res.data
}

export async function getUserById(id: string): Promise<AdminUserDetail> {
  const res = await api.get<AdminUserDetail>(`/api/admin/users/${id}`)
  return res.data
}

export async function updateUserRoles(
  id: string,
  roles: string[],
): Promise<AdminUserDetail> {
  const res = await api.put<AdminUserDetail>(`/api/admin/users/${id}/roles`, {
    roles,
  })
  return res.data
}

export async function blockUser(id: string): Promise<AdminUserDetail> {
  const res = await api.post<AdminUserDetail>(`/api/admin/users/${id}/block`)
  return res.data
}

export async function unblockUser(id: string): Promise<AdminUserDetail> {
  const res = await api.post<AdminUserDetail>(`/api/admin/users/${id}/unblock`)
  return res.data
}
