import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div
      className="civio"
      style={{
        boxSizing: 'border-box',
        // dvh tracks the visible viewport on mobile (excludes browser chrome),
        // avoids the big top gap / clipped footer that 100vh causes
        minHeight: '100dvh',
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
