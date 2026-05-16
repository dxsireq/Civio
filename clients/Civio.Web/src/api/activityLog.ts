import { api } from './client'

export type ActivityLogEntityType = 'organization' | 'booking'

export interface ActivityLogItem {
  id: string
  occurredAt: string
  eventType: string
  entityType: ActivityLogEntityType | string
  entityId: string
  entityName: string | null
  actorId: string | null
  actorEmail: string | null
  actorFullName: string | null
  oldValue: string | null
  newValue: string | null
  comment: string | null
}

export interface ActivityLogPage {
  items: ActivityLogItem[]
  total: number
  page: number
  pageSize: number
}

export interface ActivityLogQuery {
  entityType?: ActivityLogEntityType
  actorId?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export async function getActivityLog(
  query: ActivityLogQuery = {},
): Promise<ActivityLogPage> {
  const params: Record<string, string> = {}
  if (query.entityType) params.entityType = query.entityType
  if (query.actorId) params.actorId = query.actorId
  if (query.from) params.from = query.from
  if (query.to) params.to = query.to
  if (query.page) params.page = String(query.page)
  if (query.pageSize) params.pageSize = String(query.pageSize)
  const res = await api.get<ActivityLogPage>('/api/admin/activity-log', { params })
  return res.data
}
