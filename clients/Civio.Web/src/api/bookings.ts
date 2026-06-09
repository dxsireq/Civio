import { api } from './client'

export type BookingStatus =
  | 'created'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed'

export interface BookingSummary {
  id: string
  organizationId: string
  serviceId: string
  serviceName: string
  employeeId: string | null
  employeeFirstName: string | null
  employeeLastName: string | null
  citizenId: string
  statusCode: BookingStatus
  comment: string | null
  startAt: string
  createdAt: string
}

export interface Booking {
  id: string
  organizationId: string
  serviceId: string
  serviceName: string
  employeeId: string | null
  employeeFirstName: string | null
  employeeLastName: string | null
  citizenId: string
  statusCode: BookingStatus
  statusName: string
  comment: string | null
  startAt: string
  endAt: string
  createdAt: string
}

export interface ScanQrResponse {
  bookingId: string
  citizenFirstName: string
  citizenLastName: string
  serviceName: string
  startAt: string
  endAt: string
  statusCode: BookingStatus
  statusName: string
}

export async function getOrgBookings(
  orgId: string,
): Promise<BookingSummary[]> {
  const res = await api.get<BookingSummary[]>(
    `/api/organizations/${orgId}/bookings`,
  )
  return res.data
}

export async function getBooking(id: string): Promise<Booking> {
  const res = await api.get<Booking>(`/api/bookings/${id}`)
  return res.data
}

export async function confirmBooking(id: string): Promise<Booking> {
  const res = await api.post<Booking>(`/api/bookings/${id}/confirm`)
  return res.data
}

export async function rejectBooking(id: string): Promise<Booking> {
  const res = await api.post<Booking>(`/api/bookings/${id}/reject`)
  return res.data
}

export async function completeBooking(id: string): Promise<Booking> {
  const res = await api.post<Booking>(`/api/bookings/${id}/complete`)
  return res.data
}

export async function cancelBooking(id: string): Promise<Booking> {
  const res = await api.post<Booking>(`/api/bookings/${id}/cancel`)
  return res.data
}

export async function scanBookingQr(token: string): Promise<ScanQrResponse> {
  const res = await api.post<ScanQrResponse>('/api/bookings/scan', { token })
  return res.data
}
