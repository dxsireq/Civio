import { api } from './client'
import type { Service } from './services'

export interface Employee {
  id: string
  organizationId: string
  userId: string | null
  firstName: string
  lastName: string
  middleName: string | null
  position: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  middleName?: string
  position?: string
  phone?: string
  email?: string
  userId?: string
}

export type UpdateEmployeeRequest = Omit<CreateEmployeeRequest, 'userId'>

export async function getEmployees(orgId: string): Promise<Employee[]> {
  const res = await api.get<Employee[]>(
    `/api/organizations/${orgId}/employees`,
  )
  return res.data
}

export async function getEmployee(
  orgId: string,
  empId: string,
): Promise<Employee> {
  const res = await api.get<Employee>(
    `/api/organizations/${orgId}/employees/${empId}`,
  )
  return res.data
}

export async function createEmployee(
  orgId: string,
  data: CreateEmployeeRequest,
): Promise<Employee> {
  const res = await api.post<Employee>(
    `/api/organizations/${orgId}/employees`,
    data,
  )
  return res.data
}

export async function updateEmployee(
  orgId: string,
  empId: string,
  data: UpdateEmployeeRequest,
): Promise<Employee> {
  const res = await api.put<Employee>(
    `/api/organizations/${orgId}/employees/${empId}`,
    data,
  )
  return res.data
}

export async function deactivateEmployee(
  orgId: string,
  empId: string,
): Promise<void> {
  await api.delete(`/api/organizations/${orgId}/employees/${empId}`)
}

export async function getEmployeeServices(
  orgId: string,
  empId: string,
): Promise<Service[]> {
  const res = await api.get<Service[]>(
    `/api/organizations/${orgId}/employees/${empId}/services`,
  )
  return res.data
}

export async function assignServiceToEmployee(
  orgId: string,
  empId: string,
  serviceId: string,
): Promise<void> {
  await api.post(
    `/api/organizations/${orgId}/employees/${empId}/services/${serviceId}`,
  )
}

export async function unassignServiceFromEmployee(
  orgId: string,
  empId: string,
  serviceId: string,
): Promise<void> {
  await api.delete(
    `/api/organizations/${orgId}/employees/${empId}/services/${serviceId}`,
  )
}
