import { api } from './client'

export interface WorkDay {
  id: string
  employeeId: string
  workDate: string
  startTime: string
  endTime: string
  breakStart: string | null
  breakEnd: string | null
  isWorking: boolean
  createdAt: string
}

export interface CreateWorkDayRequest {
  workDate: string
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

export interface UpdateWorkDayRequest {
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

export async function getWorkDays(empId: string): Promise<WorkDay[]> {
  const res = await api.get<WorkDay[]>(`/api/employees/${empId}/work-days`)
  return res.data
}

export async function createWorkDay(
  empId: string,
  data: CreateWorkDayRequest,
): Promise<WorkDay> {
  const res = await api.post<WorkDay>(
    `/api/employees/${empId}/work-days`,
    data,
  )
  return res.data
}

export async function updateWorkDay(
  empId: string,
  workDayId: string,
  data: UpdateWorkDayRequest,
): Promise<WorkDay> {
  const res = await api.put<WorkDay>(
    `/api/employees/${empId}/work-days/${workDayId}`,
    data,
  )
  return res.data
}

export async function deleteWorkDay(
  empId: string,
  workDayId: string,
): Promise<void> {
  await api.delete(`/api/employees/${empId}/work-days/${workDayId}`)
}
