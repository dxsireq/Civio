// md3.jsx — Civio MD3 indigo design tokens + small components shared across screens.
// All shared globally on window for use by screen files.

const CIVIO = {
  // Indigo primary
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryContainer: '#E0E7FF',
  onPrimaryContainer: '#1E1B4B',
  primaryTint: '#EEF2FF',

  // Surface
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceDim: '#F6F7FB',
  surfaceContainer: '#F2F3F8',
  outline: '#C7C7D1',
  outlineVariant: '#E4E4EC',

  // Text
  onSurface: '#1B1B1F',
  onSurfaceVar: '#46464F',
  onSurfaceMuted: '#73737E',

  // Status
  error: '#B3261E',
  errorContainer: '#FCE9E7',
  success: '#1F8F4E',
  successContainer: '#DCF2E4',
  warning: '#C2620C',
  warningContainer: '#FCEBD8',

  // Type
  font: 'Roboto, "Helvetica Neue", system-ui, -apple-system, sans-serif',
};

// ────────────────────────────────────────────────────────────────
// Material Symbols-style minimal icons (stroke 1.75, 24×24)
// ────────────────────────────────────────────────────────────────
function Icon({ name, size = 24, color = 'currentColor', filled = false }) {
  const s = size;
  const c = color;
  const sw = 1.75;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow-back':
      return (<svg {...props}><path d="M15 18l-6-6 6-6"/></svg>);
    case 'chevron-right':
      return (<svg {...props}><path d="M9 6l6 6-6 6"/></svg>);
    case 'eye':
      return (<svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'eye-off':
      return (<svg {...props}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.6 10.6 0 0112 6c6.5 0 10 7 10 7a17 17 0 01-3.3 4"/><path d="M6.6 6.6A17 17 0 002 12s3.5 7 10 7c2 0 3.7-.5 5-1.3"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></svg>);
    case 'error':
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".7" fill={c}/></svg>);
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    case 'home':
      return filled
        ? (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/></svg>)
        : (<svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/></svg>);
    case 'calendar':
      return filled
        ? (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 2v3M17 2v3"/><rect x="3" y="5" width="18" height="17" rx="2"/><path stroke="#fff" strokeWidth="1.75" d="M3 10h18"/></svg>)
        : (<svg {...props}><rect x="3" y="5" width="18" height="17" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>);
    case 'bell':
      return filled
        ? (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5a.5.5 0 01-.4.8H4.9a.5.5 0 01-.4-.8L6 16z"/><path d="M10 21a2 2 0 004 0"/></svg>)
        : (<svg {...props}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5a.5.5 0 01-.4.8H4.9a.5.5 0 01-.4-.8L6 16z"/><path d="M10 21a2 2 0 004 0"/></svg>);
    case 'person':
      return filled
        ? (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0z"/></svg>)
        : (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>);
    case 'pin':
      return (<svg {...props}><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>);
    case 'phone':
      return (<svg {...props}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>);
    case 'mail':
      return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>);
    case 'clock':
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case 'tag':
      return (<svg {...props}><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1.4"/></svg>);
    case 'scissors':
      return (<svg {...props}><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M20 4L8.5 15.5M20 20L13 13M14.5 9.5L17 12"/></svg>);
    case 'check':
      return (<svg {...props}><path d="M5 12l5 5L20 7"/></svg>);
    case 'check-circle':
      return (<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z" fill="#fff"/><circle cx="12" cy="12" r="10" fill={c}/><path d="M7.5 12l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'x':
      return (<svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case 'shield':
      return (<svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>);
    case 'logout':
      return (<svg {...props}><path d="M10 17l-5-5 5-5M5 12h13M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"/></svg>);
    case 'trash':
      return (<svg {...props}><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>);
    case 'refresh':
      return (<svg {...props}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5"/></svg>);
    case 'briefcase':
      return (<svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/></svg>);
    case 'badge':
      return (<svg {...props}><path d="M12 2l9 4-1.5 9a8 8 0 01-15 0L3 6z"/></svg>);
    case 'menu-dots':
      return (<svg {...props}><circle cx="12" cy="6" r="1" fill={c}/><circle cx="12" cy="12" r="1" fill={c}/><circle cx="12" cy="18" r="1" fill={c}/></svg>);
    default:
      return <svg width={s} height={s} />;
  }
}

// ────────────────────────────────────────────────────────────────
// MD3 outlined text field
// ────────────────────────────────────────────────────────────────
function TextField({ label, value = '', placeholder, helper, error, trailing, required, multiline, rows = 3, type = 'text' }) {
  const hasValue = value && value.length > 0;
  const borderColor = error ? CIVIO.error : (hasValue ? CIVIO.primary : CIVIO.outline);
  const labelColor = error ? CIVIO.error : (hasValue ? CIVIO.primary : CIVIO.onSurfaceVar);
  return (
    <div style={{ width: '100%', fontFamily: CIVIO.font }}>
      <div style={{
        position: 'relative',
        border: `${hasValue || error ? 2 : 1}px solid ${borderColor}`,
        borderRadius: 4,
        padding: multiline ? '14px 16px' : '0 16px',
        height: multiline ? 'auto' : 56,
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff',
      }}>
        {/* Floating label */}
        <span style={{
          position: 'absolute',
          left: 12, top: hasValue || placeholder ? -8 : 18,
          fontSize: hasValue || placeholder ? 12 : 16,
          color: labelColor,
          background: '#fff',
          padding: '0 4px',
          fontWeight: hasValue || error ? 500 : 400,
          transition: 'all .15s',
        }}>
          {label}{required && <span style={{ color: CIVIO.error }}> *</span>}
        </span>
        {multiline ? (
          <div style={{
            width: '100%', minHeight: rows * 22, paddingTop: 6,
            color: hasValue ? CIVIO.onSurface : CIVIO.onSurfaceMuted,
            fontSize: 16, lineHeight: '22px',
          }}>{value || placeholder}</div>
        ) : (
          <span style={{
            flex: 1,
            color: hasValue ? CIVIO.onSurface : CIVIO.onSurfaceMuted,
            fontSize: 16, lineHeight: '24px',
          }}>{hasValue ? (type === 'password' ? '•'.repeat(value.length) : value) : placeholder}</span>
        )}
        {trailing}
      </div>
      {(helper || error) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: error ? CIVIO.error : CIVIO.onSurfaceVar,
          padding: '4px 16px 0',
        }}>
          {error && <Icon name="error" size={14} color={CIVIO.error} />}
          <span>{error || helper}</span>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// MD3 filled / outlined / text button
// ────────────────────────────────────────────────────────────────
function Button({ label, variant = 'filled', icon, color, full, disabled, danger }) {
  const isFilled = variant === 'filled';
  const isOutlined = variant === 'outlined';
  const isText = variant === 'text';

  const fg = danger ? CIVIO.error : (color || CIVIO.primary);
  const bg = isFilled ? (disabled ? '#E4E4EC' : fg) : 'transparent';
  const text = isFilled ? '#fff' : fg;
  const border = isOutlined ? `1px solid ${disabled ? CIVIO.outline : (danger ? CIVIO.error : CIVIO.outline)}` : 'none';

  return (
    <button style={{
      width: full ? '100%' : 'auto',
      height: 40,
      padding: isText ? '0 12px' : '0 24px',
      borderRadius: 100,
      border,
      background: bg,
      color: disabled ? CIVIO.onSurfaceMuted : text,
      fontFamily: CIVIO.font,
      fontSize: 14, fontWeight: 500, letterSpacing: 0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: isFilled && !disabled ? '0 1px 2px rgba(79,70,229,.18)' : 'none',
    }}>
      {icon}
      {label}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// MD3 chip (filter / assist / input)
// ────────────────────────────────────────────────────────────────
function Chip({ label, selected, leading, trailing, color, variant = 'outlined', size = 'md' }) {
  const sel = selected;
  const c = color || CIVIO.primary;
  const isFilled = variant === 'filled' || sel;
  const h = size === 'sm' ? 28 : 32;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: h,
      padding: '0 12px',
      borderRadius: 8,
      border: isFilled ? 'none' : `1px solid ${CIVIO.outline}`,
      background: isFilled ? c : '#fff',
      color: isFilled ? '#fff' : CIVIO.onSurface,
      fontFamily: CIVIO.font,
      fontSize: 13, fontWeight: 500, letterSpacing: 0.1,
      whiteSpace: 'nowrap',
    }}>
      {leading}
      {label}
      {trailing}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Bottom navigation bar
// ────────────────────────────────────────────────────────────────
function BottomNav({ active = 'catalog', badges = {} }) {
  const items = [
    { id: 'catalog', label: 'Каталог', icon: 'home' },
    { id: 'bookings', label: 'Записи', icon: 'calendar' },
    { id: 'notifications', label: 'Уведомления', icon: 'bell' },
    { id: 'profile', label: 'Профиль', icon: 'person' },
  ];
  return (
    <div style={{
      display: 'flex',
      borderTop: `1px solid ${CIVIO.outlineVariant}`,
      background: '#fff',
      paddingBottom: 0,
      fontFamily: CIVIO.font,
    }}>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '8px 0 12px',
            gap: 4,
          }}>
            <div style={{
              position: 'relative',
              width: 64, height: 32,
              borderRadius: 16,
              background: isActive ? CIVIO.primaryContainer : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={it.icon} size={22} color={isActive ? CIVIO.onPrimaryContainer : CIVIO.onSurfaceVar} filled={isActive} />
              {badges[it.id] && (
                <div style={{
                  position: 'absolute', top: 2, right: 12,
                  minWidth: 16, height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  background: CIVIO.error,
                  color: '#fff',
                  fontSize: 10, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>{badges[it.id]}</div>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, color: isActive ? CIVIO.onSurface : CIVIO.onSurfaceVar }}>
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Top app bar (small) with optional back arrow
// ────────────────────────────────────────────────────────────────
function TopBar({ title, back = true, trailing }) {
  return (
    <div style={{
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 4px',
      background: '#fff',
      fontFamily: CIVIO.font,
      flexShrink: 0,
    }}>
      <div style={{
        width: 48, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {back && <Icon name="arrow-back" size={24} color={CIVIO.onSurface} />}
      </div>
      <div style={{ flex: 1, fontSize: 18, fontWeight: 500, color: CIVIO.onSurface }}>{title}</div>
      {trailing}
    </div>
  );
}

// Civio "C" logo mark
function LogoMark({ size = 64 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: CIVIO.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontFamily: CIVIO.font,
      fontSize: size * 0.55,
      fontWeight: 700,
      letterSpacing: -1,
      boxShadow: '0 6px 20px rgba(79,70,229,.35)',
    }}>C</div>
  );
}

// Phone shell — wraps a content function to provide consistent device chrome
function Phone({ children, statusDark = false, navDark = false, bg = '#fff' }) {
  const W = 390, H = 844;
  return (
    <div style={{
      width: W, height: H,
      background: bg,
      borderRadius: 18,
      overflow: 'hidden',
      border: '8px solid rgba(116,119,117,0.5)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: CIVIO.font,
      color: CIVIO.onSurface,
    }}>
      <AndroidStatusBar dark={statusDark} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <AndroidNavBar dark={navDark} />
    </div>
  );
}

Object.assign(window, { CIVIO, Icon, TextField, Button, Chip, BottomNav, TopBar, LogoMark, Phone });
