import { api } from './client'

export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'blocked'

export interface Organization {
  id: string
  ownerUserId: string
  name: string
  status: OrganizationStatus
  city: string
  address: string
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  createdAt: string
}

export async function getAllOrganizations(): Promise<Organization[]> {
  const res = await api.get<Organization[]>('/api/admin/organizations')
  return res.data
}

export interface ModerationRequest {
  comment?: string
}

export async function approveOrganization(
  id: string,
  data: ModerationRequest = {},
): Promise<Organization> {
  const res = await api.post<Organization>(
    `/api/admin/organizations/${id}/approve`,
    data,
  )
  return res.data
}

export async function rejectOrganization(
  id: string,
  data: ModerationRequest,
): Promise<Organization> {
  const res = await api.post<Organization>(
    `/api/admin/organizations/${id}/reject`,
    data,
  )
  return res.data
}

export async function blockOrganization(
  id: string,
  data: ModerationRequest,
): Promise<Organization> {
  const res = await api.post<Organization>(
    `/api/admin/organizations/${id}/block`,
    data,
  )
  return res.data
}
