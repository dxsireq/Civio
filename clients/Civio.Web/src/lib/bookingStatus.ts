import type { BookingStatus } from '../api/bookings'

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  created: 'Создана',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  rejected: 'Отклонена',
  completed: 'Завершена',
}

export const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  created: 'badge badge-pending',
  confirmed: 'badge badge-info',
  completed: 'badge badge-approved',
  cancelled: 'badge badge-blocked',
  rejected: 'badge badge-rejected',
}
