import { useEffect, useState } from 'react'
import { Scissors } from 'lucide-react'
import { TopbarLeft } from '../../components/Topbar'
import { useEmployeeContext } from '../../components/EmployeeLayout'
import { getOrganization, type Organization } from '../../api/organizations'
import { getEmployeeServices } from '../../api/employees'
import type { Service } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { ORG_STATUS_BADGE, ORG_STATUS_LABEL } from '../../lib/orgStatus'
import type { OrganizationStatus } from '../../api/admin'

export function EmployeeDashboardPage() {
  const { employeeId, orgId, employeeRecord } = useEmployeeContext()
  const [org, setOrg] = useState<Organization | null>(null)
  const [services, setServices] = useState<Service[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getOrganization(orgId), getEmployeeServices(orgId, employeeId)])
      .then(([o, svcs]) => {
        if (!cancelled) {
          setOrg(o)
          setServices(svcs)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => { cancelled = true }
  }, [orgId, employeeId])

  return (
    <>
      <TopbarLeft>
        <span>{org?.name ?? '…'}</span>
      </TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Обзор</h1>
            <div className="page-subtitle">
              {employeeRecord.position ?? 'Сотрудник'} · {org?.name}
            </div>
          </div>
        </div>

        {error && (
          <div className="card" style={{ padding: 16, color: 'var(--red-600)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Организация
            </div>
            {org === null ? (
              <div style={{ color: 'var(--text-soft)', fontSize: 14 }}>Загрузка…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{org.name}</div>
                  <span className={ORG_STATUS_BADGE[org.status as OrganizationStatus]}>
                    <span className="badge-dot" />
                    {ORG_STATUS_LABEL[org.status as OrganizationStatus]}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{org.city}, {org.address}</div>
                {org.phone && <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{org.phone}</div>}
                {org.email && <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{org.email}</div>}
                {org.description && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{org.description}</div>
                )}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Мои данные
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {employeeRecord.lastName} {employeeRecord.firstName} {employeeRecord.middleName ?? ''}
              </div>
              {employeeRecord.position && (
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{employeeRecord.position}</div>
              )}
              {employeeRecord.phone && (
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{employeeRecord.phone}</div>
              )}
              {employeeRecord.email && (
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{employeeRecord.email}</div>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Scissors size={15} style={{ color: 'var(--text-soft)' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Мои услуги
            </div>
          </div>
          {services === null ? (
            <div style={{ color: 'var(--text-soft)', fontSize: 14 }}>Загрузка…</div>
          ) : services.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Нет назначенных услуг</div>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <table className="table table-cards">
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Длительность</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td data-label="Услуга" style={{ fontWeight: 500 }}>{s.name}</td>
                      <td data-label="Длительность" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-soft)' }}>{s.durationMinutes} мин</td>
                      <td data-label="Цена" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-soft)' }}>
                        {s.price !== null ? `${Number(s.price).toLocaleString('ru-RU')} ₽` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
