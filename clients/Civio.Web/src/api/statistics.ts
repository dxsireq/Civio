import { api } from './client'

export interface OrgStatisticsTotals {
  totalRevenue: number
  completedCount: number
  totalBookings: number
  cancelledCount: number
  rejectedCount: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  count: number
}

export interface RevenueByService {
  serviceId: string
  serviceName: string
  revenue: number
  count: number
}

export interface RevenueByEmployee {
  employeeId: string
  firstName: string
  lastName: string
  revenue: number
  count: number
}

export interface BookingsByStatus {
  statusCode: string
  statusName: string
  count: number
}

export interface OrgStatistics {
  organizationId: string
  from: string
  to: string
  totals: OrgStatisticsTotals
  revenueByDay: RevenuePoint[]
  revenueByService: RevenueByService[]
  revenueByEmployee: RevenueByEmployee[]
  bookingsByStatus: BookingsByStatus[]
}

export async function getOrganizationStatistics(
  orgId: string,
  from: string,
  to: string,
): Promise<OrgStatistics> {
  const res = await api.get<OrgStatistics>(`/api/organizations/${orgId}/statistics`, {
    params: { from, to },
  })
  return res.data
}
