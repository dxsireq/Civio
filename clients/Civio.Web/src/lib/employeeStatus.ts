import type { EmployeeMembershipStatus } from '../api/employees'

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeMembershipStatus, string> = {
  pending: 'Ожидает',
  active: 'Активен',
  fired: 'Уволен',
}

export const EMPLOYEE_STATUS_BADGE: Record<EmployeeMembershipStatus, string> = {
  pending: 'badge badge-pending',
  active: 'badge badge-approved',
  fired: 'badge badge-neutral',
}
