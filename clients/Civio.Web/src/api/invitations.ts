import { api } from './client'
import type { AuthResponse } from './auth'

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface InvitationInfo {
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  phone: string | null
  position: string | null
  organizationName: string
  userExists: boolean
  status: InvitationStatus
  expiresAt: string
}

export interface AcceptInvitationRegisterRequest {
  password: string
  firstName?: string
  lastName?: string
  middleName?: string
  phone?: string
}

export async function getInvitation(token: string): Promise<InvitationInfo> {
  const res = await api.get<InvitationInfo>(`/api/invitations/${token}`)
  return res.data
}

export async function acceptInvitationWithRegistration(
  token: string,
  data: AcceptInvitationRegisterRequest,
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>(
    `/api/invitations/${token}/accept-register`,
    data,
  )
  return res.data
}

export async function acceptInvitation(token: string): Promise<void> {
  await api.post(`/api/invitations/${token}/accept`)
}

export async function resendInvitation(
  orgId: string,
  empId: string,
): Promise<void> {
  await api.post(
    `/api/organizations/${orgId}/employees/${empId}/invitation/resend`,
  )
}

export async function revokeInvitation(
  orgId: string,
  empId: string,
): Promise<void> {
  await api.post(
    `/api/organizations/${orgId}/employees/${empId}/invitation/revoke`,
  )
}
