import { api } from './client'
import type { Organization } from './admin'

export type { Organization } from './admin'

export interface CreateOrganizationRequest {
  name: string
  city: string
  address: string
  description?: string
  email?: string
  phone?: string
  website?: string
}

export type UpdateOrganizationRequest = CreateOrganizationRequest

export async function getMyOrganizations(): Promise<Organization[]> {
  const res = await api.get<Organization[]>('/api/organizations/my')
  return res.data
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await api.get<Organization>(`/api/organizations/${id}`)
  return res.data
}

export async function createOrganization(
  data: CreateOrganizationRequest,
): Promise<Organization> {
  const res = await api.post<Organization>('/api/organizations', data)
  return res.data
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganizationRequest,
): Promise<Organization> {
  const res = await api.put<Organization>(`/api/organizations/${id}`, data)
  return res.data
}
