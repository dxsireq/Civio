import { useEffect, useState } from 'react'
import { TopbarLeft } from '../../components/Topbar'
import { useEmployeeContext } from '../../components/EmployeeLayout'
import { getWorkDays, type WorkDay } from '../../api/workDays'
import { getErrorMessage } from '../../api/client'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { weekday: 'short', timeZone: 'UTC' })
}

export function MySchedulePage() {
  const { employeeId, employeeRecord } = useEmployeeContext()
  const [days, setDays] = useState<WorkDay[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getWorkDays(employeeId)
      .then((data) => {
        if (!cancelled) setDays(data.sort((a, b) => a.workDate.localeCompare(b.workDate)))
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => { cancelled = true }
  }, [employeeId])

  return (
    <>
      <TopbarLeft>
        <span>{employeeRecord.organizationName} / Моё расписание</span>
      </TopbarLeft>

      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Моё расписание</h1>
            <div className="page-subtitle">Рабочие дни и часы</div>
          </div>
        </div>

        {error && (
          <div className="card" style={{ padding: 16, color: 'var(--red-600)', marginBottom: 16 }}>{error}</div>
        )}

        <div className="card" style={{ padding: 0 }}>
          {days === null ? (
            <div style={{ padding: 24, color: 'var(--text-soft)', fontSize: 14 }}>Загрузка…</div>
          ) : days.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Нет рабочих дней</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-cards">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>День</th>
                    <th>Начало</th>
                    <th>Конец</th>
                    <th>Перерыв</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d.id}>
                      <td data-label="Дата" style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatDate(d.workDate)}</td>
                      <td data-label="День" style={{ color: 'var(--text-soft)' }}>{formatDay(d.workDate)}</td>
                      <td data-label="Начало" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-soft)' }}>{d.startTime.slice(0, 5)}</td>
                      <td data-label="Конец" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-soft)' }}>{d.endTime.slice(0, 5)}</td>
                      <td data-label="Перерыв" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-soft)' }}>
                        {d.breakStart && d.breakEnd ? `${d.breakStart.slice(0, 5)}–${d.breakEnd.slice(0, 5)}` : '—'}
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
