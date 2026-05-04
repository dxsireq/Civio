// screens-9-12.jsx — BookingDetail, QrCode, Notifications, Profile

// ─────────────────────────────────────────────────────────────
// Screen 9 — BookingDetailScreen
// ─────────────────────────────────────────────────────────────
function TimelineEntry({ status, when, who, last }) {
  const map = {
    'Подтверждена':  { bg: CIVIO.successContainer, fg: CIVIO.success },
    'Создана':       { bg: CIVIO.warningContainer, fg: CIVIO.warning },
  };
  const c = map[status];
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      <div style={{ width: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.fg, border: `3px solid ${c.bg}`, boxSizing: 'content-box', marginLeft: -2 }} />
        {!last && <div style={{ flex: 1, width: 2, background: CIVIO.outlineVariant, marginTop: 2 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: last ? 0 : 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 100, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, letterSpacing: 0.1 }}>{status}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: CIVIO.onSurface, fontWeight: 500 }}>{when}</div>
        <div style={{ marginTop: 2, fontSize: 12, color: CIVIO.onSurfaceMuted }}>{who}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderTop: `1px solid ${CIVIO.outlineVariant}`, gap: 16 }}>
      <span style={{ fontSize: 13, color: CIVIO.onSurfaceVar }}>{label}</span>
      <span style={{ fontSize: 14, color: CIVIO.onSurface, fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function BookingDetailScreen() {
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <TopBar title="Запись #1234" />
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 24px' }}>
        {/* Status chip */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 14px', borderRadius: 100,
            background: CIVIO.success, color: '#fff',
            fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="check" size={16} color="#fff" />
            Подтверждена
          </div>
        </div>

        {/* Info card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: `1px solid ${CIVIO.outlineVariant}`,
          padding: '16px 18px',
          boxShadow: '0 2px 8px rgba(20,20,40,.04)',
        }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Студия Civio</div>
          <div style={{ marginTop: 8 }}>
            <DetailRow label="Услуга" value="Женская стрижка · 60 мин" />
            <DetailRow label="Сотрудник" value="Мария Иванова, стилист" />
            <DetailRow label="Дата" value="Пн, 5 мая 2026" />
            <DetailRow label="Время" value="10:00 — 11:00" />
            <DetailRow label="Стоимость" value="1 500 ₽" />
            <DetailRow label="Комментарий" value="Стрижка по плечи, без чёлки" />
          </div>
        </div>

        {/* History */}
        <div style={{ marginTop: 24, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          История
        </div>
        <div style={{ marginTop: 14, paddingLeft: 4 }}>
          <TimelineEntry status="Подтверждена" when="3 мая, 14:22" who="Изменено: Студия Civio" />
          <TimelineEntry status="Создана"      when="3 мая, 13:48" who="Изменено: Алексей Сидоров" last />
        </div>

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            width: '100%', height: 52, borderRadius: 100, border: 'none',
            background: CIVIO.primary, color: '#fff',
            fontFamily: CIVIO.font, fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
            boxShadow: '0 6px 20px rgba(79,70,229,.32)',
          }}>Показать QR-код</button>
          <button style={{
            width: '100%', height: 48, borderRadius: 100,
            border: `1px solid ${CIVIO.error}`,
            background: 'transparent', color: CIVIO.error,
            fontFamily: CIVIO.font, fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
          }}>Отменить запись</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 10 — QrCodeScreen
// ─────────────────────────────────────────────────────────────
function QrPlaceholder({ size = 240 }) {
  // procedural QR-ish dot grid
  const N = 21;
  const cells = [];
  // simple deterministic pattern
  const seed = (x, y) => ((x * 73856093) ^ (y * 19349663) ^ ((x + y) * 83492791)) >>> 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = (seed(x, y) % 100) < 48;
      cells.push({ x, y, v });
    }
  }
  // finder squares
  const isFinder = (x, y) => (
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7)
  );
  return (
    <div style={{ width: size, height: size, position: 'relative', background: '#fff' }}>
      <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} style={{ shapeRendering: 'crispEdges' }}>
        {cells.map(({ x, y, v }) => {
          if (isFinder(x, y)) return null;
          if (!v) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0e0e14" />;
        })}
        {/* Finder patterns */}
        {[[0,0],[N-7,0],[0,N-7]].map(([fx, fy], i) => (
          <g key={i}>
            <rect x={fx} y={fy} width="7" height="7" fill="#0e0e14" />
            <rect x={fx+1} y={fy+1} width="5" height="5" fill="#fff" />
            <rect x={fx+2} y={fy+2} width="3" height="3" fill="#0e0e14" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function QrCodeScreen() {
  return (
    <Phone bg="#ECEDF3">
      <TopBar title="QR-код для записи" />
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: '#fff',
          borderRadius: 22,
          padding: '22px 22px 24px',
          boxShadow: '0 12px 40px rgba(20,20,40,.08)',
          border: `1px solid ${CIVIO.outlineVariant}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 12, color: CIVIO.onSurfaceMuted, fontStyle: 'italic', textAlign: 'center' }}>
            Предъявите сотруднику на стойке
          </div>
          <div style={{
            padding: 14, background: '#fff',
            border: `1px solid ${CIVIO.outlineVariant}`, borderRadius: 14,
          }}>
            <QrPlaceholder size={240} />
          </div>
          <div style={{ width: '100%', borderTop: `1px solid ${CIVIO.outlineVariant}`, paddingTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: CIVIO.onSurface }}>Студия Civio</div>
            <div style={{ fontSize: 13, color: CIVIO.onSurfaceVar }}>Женская стрижка · Мария Иванова</div>
            <div style={{ fontSize: 13, color: CIVIO.onSurface, fontWeight: 500, marginTop: 2 }}>5 мая 2026 · 10:00</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 30, padding: '0 14px', borderRadius: 100,
            background: CIVIO.primaryTint, color: CIVIO.primary,
            border: `1px solid ${CIVIO.primaryContainer}`,
            fontSize: 12, fontWeight: 600,
          }}>
            <Icon name="clock" size={14} color={CIVIO.primary} />
            Действителен до 6 мая 2026
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ marginTop: 24 }}>
          <button style={{
            width: '100%', height: 48, borderRadius: 100,
            border: `1px solid ${CIVIO.outline}`,
            background: '#fff', color: CIVIO.onSurface,
            fontFamily: CIVIO.font, fontSize: 15, fontWeight: 600,
          }}>Назад к записи</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 11 — NotificationsScreen
// ─────────────────────────────────────────────────────────────
function NotificationItem({ kind, title, sub, time, unread, last }) {
  const map = {
    confirmed: { bg: CIVIO.successContainer, fg: CIVIO.success, icon: 'check' },
    created:   { bg: CIVIO.warningContainer, fg: CIVIO.warning, icon: 'plus' },
    cancelled: { bg: CIVIO.errorContainer,   fg: CIVIO.error,   icon: 'x' },
    completed: { bg: '#ECEDF2',              fg: CIVIO.onSurfaceVar, icon: 'check' },
  };
  const c = map[kind];
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 20px',
      background: unread ? '#EEF2FF' : 'transparent',
      borderBottom: last ? 'none' : `1px solid ${CIVIO.outlineVariant}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: c.bg, color: c.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={c.icon} size={20} color={c.fg} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: CIVIO.onSurface, lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 11, color: CIVIO.onSurfaceMuted, whiteSpace: 'nowrap' }}>{time}</div>
        </div>
        <div style={{ marginTop: 2, fontSize: 13, color: CIVIO.onSurfaceVar, lineHeight: 1.35 }}>{sub}</div>
      </div>
      {unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: CIVIO.primary, marginTop: 8, flexShrink: 0 }} />}
    </div>
  );
}

function NotificationsScreen() {
  return (
    <Phone bg="#fff">
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '12px 20px 12px' }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>Уведомления</div>
        </div>
        <div>
          <NotificationItem kind="confirmed" title="Запись подтверждена" sub="Стрижка · Студия Civio · 5 мая, 10:00" time="2 ч назад" unread />
          <NotificationItem kind="created"   title="Запись создана"      sub="Маникюр · Лак&Лак · 7 мая, 18:00"      time="вчера"   unread />
          <NotificationItem kind="cancelled" title="Запись отменена"     sub="Терапевт · Здоровье+ · 30 апр, 09:30"  time="2 дня"   />
          <NotificationItem kind="completed" title="Запись завершена"    sub="Барбершоп «Север» · 22 апр"             time="неделю"  last />
        </div>
      </div>
      <BottomNav active="notifications" badges={{ notifications: 3 }} />
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 12 — ProfileScreen (with logout dialog overlay)
// ─────────────────────────────────────────────────────────────
function ProfileRow({ icon, value, chevron }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
      <Icon name={icon} size={20} color={CIVIO.onSurfaceVar} />
      <div style={{ flex: 1, fontSize: 15, color: CIVIO.onSurface }}>{value}</div>
      {chevron && <Icon name="chevron-right" size={20} color={CIVIO.onSurfaceMuted} />}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ padding: '20px 20px 6px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function ProfileScreen({ showDialog }) {
  return (
    <Phone bg="#fff">
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {/* Avatar block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 20px 16px' }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            background: CIVIO.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 600, letterSpacing: 0.5,
            boxShadow: '0 6px 20px rgba(79,70,229,.28)',
          }}>АС</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: CIVIO.onSurface }}>Алексей Сидоров</div>
          <div style={{ fontSize: 13, color: CIVIO.onSurfaceVar }}>client@civio.test</div>
        </div>

        <SectionLabel>Личные данные</SectionLabel>
        <ProfileRow icon="person" value="Алексей Сидоров" />
        <ProfileRow icon="mail"   value="client@civio.test" />
        <ProfileRow icon="phone"  value="+7 900 000-00-03" />

        <div style={{ height: 1, background: CIVIO.outlineVariant, margin: '8px 20px' }} />

        <SectionLabel>Аккаунт</SectionLabel>
        <ProfileRow icon="bell"   value="Уведомления" chevron />
        <ProfileRow icon="shield" value="Безопасность" chevron />

        <div style={{ padding: '24px 20px 24px' }}>
          <button style={{
            width: '100%', height: 48, borderRadius: 100,
            border: `1px solid ${CIVIO.error}`,
            background: 'transparent', color: CIVIO.error,
            fontFamily: CIVIO.font, fontSize: 15, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="logout" size={18} color={CIVIO.error} />
            Выйти из аккаунта
          </button>
        </div>

        {/* Logout confirm dialog overlay */}
        {showDialog && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(28, 27, 31, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}>
            <div style={{
              width: '100%', maxWidth: 320,
              background: '#fff',
              borderRadius: 24,
              padding: '24px 24px 16px',
              boxShadow: '0 16px 48px rgba(0,0,0,.25)',
            }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: CIVIO.onSurface }}>Выйти?</div>
              <div style={{ marginTop: 12, fontSize: 14, color: CIVIO.onSurfaceVar, lineHeight: 1.4 }}>
                Вам потребуется ввести email и пароль для следующего входа.
              </div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button style={{
                  height: 40, padding: '0 16px', borderRadius: 100,
                  background: 'transparent', border: 'none',
                  color: CIVIO.primary, fontFamily: CIVIO.font, fontSize: 14, fontWeight: 600,
                }}>Отмена</button>
                <button style={{
                  height: 40, padding: '0 18px', borderRadius: 100,
                  background: CIVIO.error, border: 'none',
                  color: '#fff', fontFamily: CIVIO.font, fontSize: 14, fontWeight: 600,
                }}>Выйти</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav active="profile" badges={{ notifications: 3 }} />
    </Phone>
  );
}

Object.assign(window, { BookingDetailScreen, QrCodeScreen, NotificationsScreen, ProfileScreen });
