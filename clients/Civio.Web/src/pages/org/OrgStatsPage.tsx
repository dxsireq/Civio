import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  getOrganizationStatistics,
  type OrgStatistics,
} from '../../api/statistics'
import { getErrorMessage } from '../../api/client'

const RUB = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
const formatRub = (v: unknown) => RUB.format(Number(v ?? 0))

const PIE_COLORS = [
  'var(--indigo-700)',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
]

const STATUS_COLOR: Record<string, string> = {
  created: '#6366f1',
  confirmed: '#0ea5e9',
  completed: '#10b981',
  cancelled: '#9ca3af',
  rejected: '#ef4444',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoStr(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function toUtcFrom(dateStr: string) {
  return `${dateStr}T00:00:00Z`
}

function toUtcTo(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setDate(d.getDate() + 1)
  return d.toISOString().replace('.000Z', 'Z')
}

function formatXDate(label: unknown) {
  const d = new Date(String(label))
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export function OrgStatsPage() {
  const { id } = useParams<{ id: string }>()
  const [fromDate, setFromDate] = useState(daysAgoStr(30))
  const [toDate, setToDate] = useState(todayStr())
  const [pendingFrom, setPendingFrom] = useState(fromDate)
  const [pendingTo, setPendingTo] = useState(toDate)
  const [data, setData] = useState<OrgStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    getOrganizationStatistics(id, toUtcFrom(fromDate), toUtcTo(toDate))
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, fromDate, toDate])

  const applyRange = () => {
    setFromDate(pendingFrom)
    setToDate(pendingTo)
  }

  const setPreset = (days: number | 'year') => {
    const to = todayStr()
    const from =
      days === 'year'
        ? `${new Date().getFullYear()}-01-01`
        : daysAgoStr(days as number)
    setPendingFrom(from)
    setPendingTo(to)
    setFromDate(from)
    setToDate(to)
  }

  if (!id) return null

  const t = data?.totals

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Статистика</h1>
          <div className="page-subtitle">
            Только завершённые услуги учитываются в выручке
          </div>
        </div>
      </div>

      {/* Lifetime totals */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
        <StatCard label="Общая выручка" value={t ? formatRub(t.totalRevenue) : null} />
        <StatCard label="Оказано услуг" value={t?.completedCount ?? null} />
        <StatCard label="Всего записей" value={t?.totalBookings ?? null} />
        <StatCard
          label="Отменено"
          value={t ? t.cancelledCount + t.rejectedCount : null}
        />
      </div>

      {/* Date range controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span
              style={{ fontSize: 13, color: 'var(--text-soft)', fontWeight: 500 }}
            >
              Период:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreset(d)}
                >
                  {d} дней
                </button>
              ))}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPreset('year')}
              >
                Год
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 'auto',
              }}
            >
              <input
                type="date"
                value={pendingFrom}
                max={pendingTo}
                onChange={(e) => setPendingFrom(e.target.value)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: '4px 8px',
                  fontSize: 13,
                  color: 'var(--text)',
                  background: 'var(--surface)',
                }}
              />
              <span style={{ color: 'var(--text-soft)', fontSize: 13 }}>—</span>
              <input
                type="date"
                value={pendingTo}
                min={pendingFrom}
                onChange={(e) => setPendingTo(e.target.value)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: '4px 8px',
                  fontSize: 13,
                  color: 'var(--text)',
                  background: 'var(--surface)',
                }}
              />
              <button className="btn btn-primary btn-sm" onClick={applyRange}>
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--red-600)', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div
          style={{
            color: 'var(--text-soft)',
            padding: 40,
            textAlign: 'center',
          }}
        >
          Загрузка…
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Revenue over time */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Выручка по дням</h2>
            </div>
            <div className="card-body">
              {data.revenueByDay.every((d) => d.revenue === 0) ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data.revenueByDay}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXDate}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={formatRub}
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={formatRub}
                      labelFormatter={formatXDate}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="var(--indigo-700)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid-2" style={{ gap: 18 }}>
            {/* Revenue by service */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Выручка по услугам</h2>
              </div>
              <div className="card-body">
                {data.revenueByService.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.revenueByService}
                        dataKey="revenue"
                        nameKey="serviceName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(p: any) =>
                          `${p.serviceName} ${((p.percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {data.revenueByService.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatRub} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bookings by status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Записи по статусам</h2>
              </div>
              <div className="card-body">
                {data.bookingsByStatus.every((s) => s.count === 0) ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.bookingsByStatus.filter((s) => s.count > 0)}
                        dataKey="count"
                        nameKey="statusName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(p: any) =>
                          `${p.statusName} ${((p.percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {data.bookingsByStatus
                          .filter((s) => s.count > 0)
                          .map((s, i) => (
                            <Cell
                              key={i}
                              fill={
                                STATUS_COLOR[s.statusCode] ??
                                PIE_COLORS[i % PIE_COLORS.length]
                              }
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Revenue by employee */}
          {data.revenueByEmployee.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Выручка по сотрудникам</h2>
              </div>
              <div className="card-body">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, data.revenueByEmployee.length * 44)}
                >
                  <BarChart
                    data={data.revenueByEmployee.map((e) => ({
                      ...e,
                      name: `${e.firstName} ${e.lastName}`,
                    }))}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={formatRub}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip formatter={formatRub} />
                    <Bar
                      dataKey="revenue"
                      fill="var(--indigo-700)"
                      radius={[0, 3, 3, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number | string | null
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value === null ? '—' : value}
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div
      style={{
        height: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-soft)',
        fontSize: 13,
      }}
    >
      Нет данных за выбранный период
    </div>
  )
}
