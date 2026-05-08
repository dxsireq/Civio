import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div
      className="civio"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-soft)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Outlet />
      </div>
    </div>
  )
}
