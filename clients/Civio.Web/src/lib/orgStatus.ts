import type { OrganizationStatus } from '../api/admin'

export const ORG_STATUS_LABEL: Record<OrganizationStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  blocked: 'Заблокирована',
}

export const ORG_STATUS_BADGE: Record<OrganizationStatus, string> = {
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
  blocked: 'badge badge-blocked',
}
