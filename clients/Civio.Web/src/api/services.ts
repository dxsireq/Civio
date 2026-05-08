import { api } from './client'

export interface Service {
  id: string
  organizationId: string
  categoryId: string | null
  name: string
  description: string | null
  durationMinutes: number
  price: number | null
  isActive: boolean
  createdAt: string
}

export interface CreateServiceRequest {
  name: string
  description?: string
  durationMinutes: number
  price?: number
  categoryId?: string
}

export type UpdateServiceRequest = CreateServiceRequest

export async function getServices(orgId: string): Promise<Service[]> {
  const res = await api.get<Service[]>(`/api/organizations/${orgId}/services`)
  return res.data
}

export async function createService(
  orgId: string,
  data: CreateServiceRequest,
): Promise<Service> {
  const res = await api.post<Service>(
    `/api/organizations/${orgId}/services`,
    data,
  )
  return res.data
}

export async function updateService(
  orgId: string,
  serviceId: string,
  data: UpdateServiceRequest,
): Promise<Service> {
  const res = await api.put<Service>(
    `/api/organizations/${orgId}/services/${serviceId}`,
    data,
  )
  return res.data
}

export async function deactivateService(
  orgId: string,
  serviceId: string,
): Promise<void> {
  await api.delete(`/api/organizations/${orgId}/services/${serviceId}`)
}
