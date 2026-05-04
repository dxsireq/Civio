// screens-5-8.jsx — BookService, SelectSlot, ConfirmBooking, Bookings

// ─────────────────────────────────────────────────────────────
// Screen 5 — BookServiceScreen
// ─────────────────────────────────────────────────────────────
function ServiceSelectCard({ name, dur, price, selected }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: `${selected ? 2 : 1}px solid ${selected ? CIVIO.primary : CIVIO.outlineVariant}`,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: selected ? '0 2px 10px rgba(79,70,229,.12)' : '0 1px 2px rgba(20,20,40,.03)',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${selected ? CIVIO.primary : CIVIO.outline}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 11, height: 11, borderRadius: '50%', background: CIVIO.primary }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: CIVIO.onSurface }}>{name}</div>
        <div style={{ fontSize: 13, color: CIVIO.onSurfaceVar, marginTop: 2 }}>{dur}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: selected ? CIVIO.primary : CIVIO.onSurface }}>{price}</div>
    </div>
  );
}

function DateChip({ day, num, selected, today }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 56, height: 72,
      borderRadius: 14,
      background: selected ? CIVIO.primary : '#fff',
      border: selected ? 'none' : `1px solid ${CIVIO.outlineVariant}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      color: selected ? '#fff' : CIVIO.onSurface,
      boxShadow: selected ? '0 4px 12px rgba(79,70,229,.25)' : 'none',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: selected ? 0.85 : 0.7, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {today ? 'Сег' : day}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{num}</div>
    </div>
  );
}

function BookServiceScreen() {
  const dates = [
    { day: 'Сег', num: 4, today: true },
    { day: 'Пн', num: 5, selected: true },
    { day: 'Вт', num: 6 },
    { day: 'Ср', num: 7 },
    { day: 'Чт', num: 8 },
    { day: 'Пт', num: 9 },
    { day: 'Сб', num: 10 },
    { day: 'Вс', num: 11 },
  ];
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <TopBar title="Выбор услуги и даты" />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 96, position: 'relative' }}>
        <div style={{ padding: '8px 20px 8px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          Услуга
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ServiceSelectCard name="Женская стрижка" dur="60 мин" price="1 500 ₽" selected />
          <ServiceSelectCard name="Окрашивание в один тон" dur="120 мин" price="3 800 ₽" />
          <ServiceSelectCard name="Уходовый комплекс" dur="45 мин" price="2 200 ₽" />
        </div>

        <div style={{ padding: '24px 20px 8px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          Дата
        </div>
        <div style={{
          display: 'flex', gap: 8,
          padding: '0 20px 24px',
          overflowX: 'auto',
        }}>
          {dates.map((d, i) => <DateChip key={i} {...d} />)}
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 24,
        padding: '12px 20px',
        background: 'linear-gradient(to bottom, rgba(246,247,251,0), rgba(246,247,251,1) 40%)',
      }}>
        <button style={{
          width: '100%', height: 52, borderRadius: 100, border: 'none',
          background: CIVIO.primary, color: '#fff',
          fontFamily: CIVIO.font, fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
          boxShadow: '0 6px 20px rgba(79,70,229,.32)',
        }}>Посмотреть слоты</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 6 — SelectSlotScreen
// ─────────────────────────────────────────────────────────────
function SlotChip({ time, state, employee }) {
  // state: 'available' | 'selected' | 'unavailable'
  const isSel = state === 'selected';
  const isUn = state === 'unavailable';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: '100%',
        height: 44,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isSel ? CIVIO.primary : (isUn ? '#F1F1F4' : '#fff'),
        color: isSel ? '#fff' : (isUn ? CIVIO.onSurfaceMuted : CIVIO.onSurface),
        border: isSel ? 'none' : (isUn ? `1px solid #ECECF0` : `1px solid ${CIVIO.outline}`),
        fontSize: 15, fontWeight: 600,
        textDecoration: isUn ? 'line-through' : 'none',
        boxShadow: isSel ? '0 4px 12px rgba(79,70,229,.25)' : 'none',
      }}>
        {time}
      </div>
      <div style={{ fontSize: 10, color: CIVIO.onSurfaceMuted, height: 12 }}>{employee || ''}</div>
    </div>
  );
}

function SelectSlotScreen() {
  const slots = [
    ['10:00','available','Мария И.'], ['10:30','available'], ['11:00','unavailable'],
    ['11:30','selected'], ['12:00','available'], ['12:30','unavailable'],
    ['13:00','available'], ['13:30','available'], ['14:00','available'],
    ['14:30','unavailable'], ['15:00','available'], ['15:30','available'],
  ];
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <TopBar title="Выбор времени" />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 96, position: 'relative' }}>
        {/* Summary chips */}
        <div style={{ padding: '8px 20px 4px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip
            label="Женская стрижка"
            variant="outlined"
            color={CIVIO.primary}
            trailing={<Icon name="x" size={14} color={CIVIO.primary} />}
          />
          <Chip
            label="Пн, 5 мая"
            variant="outlined"
            color={CIVIO.primary}
            trailing={<Icon name="x" size={14} color={CIVIO.primary} />}
          />
        </div>
        {/* override chip styles for outlined indigo */}

        <div style={{ padding: '20px 20px 8px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          Доступные слоты
        </div>

        <div style={{
          padding: '0 20px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 10px',
        }}>
          {slots.map(([t, s, e], i) => <SlotChip key={i} time={t} state={s} employee={e} />)}
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 24,
        padding: '12px 20px',
        background: 'linear-gradient(to bottom, rgba(246,247,251,0), rgba(246,247,251,1) 40%)',
      }}>
        <button style={{
          width: '100%', height: 52, borderRadius: 100, border: 'none',
          background: CIVIO.primary, color: '#fff',
          fontFamily: CIVIO.font, fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
          boxShadow: '0 6px 20px rgba(79,70,229,.32)',
        }}>Продолжить</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 7 — ConfirmBookingScreen
// ─────────────────────────────────────────────────────────────
function SummaryRow({ icon, label, value, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: CIVIO.primaryTint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={icon} size={18} color={CIVIO.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 15, color: CIVIO.onSurface, fontWeight: bold ? 600 : 500, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function ConfirmBookingScreen() {
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <TopBar title="Подтверждение" />
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 24px' }}>
        {/* Summary card */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: '20px 18px 8px',
          boxShadow: '0 4px 16px rgba(20,20,40,.06)',
          border: `1px solid ${CIVIO.outlineVariant}`,
        }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: CIVIO.onSurface, lineHeight: 1.25 }}>Студия Civio</div>
          <div style={{ marginTop: 4, fontSize: 13, color: CIVIO.onSurfaceVar }}>Никольская, 12</div>
          <div style={{ height: 1, background: CIVIO.outlineVariant, margin: '14px -2px 4px' }} />
          <SummaryRow icon="scissors" label="Услуга" value="Женская стрижка" />
          <SummaryRow icon="person" label="Сотрудник" value="Мария Иванова" />
          <SummaryRow icon="calendar" label="Дата" value="Понедельник, 5 мая 2026" />
          <SummaryRow icon="clock" label="Время" value="10:00 — 11:00" />
          <SummaryRow icon="tag" label="Стоимость" value="1 500 ₽" bold />
        </div>

        <div style={{ marginTop: 24, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          Комментарий
        </div>
        <div style={{ marginTop: 10 }}>
          <TextField label="Комментарий" placeholder="Ваши пожелания (необязательно)" multiline rows={3} />
        </div>

        {/* Info banner */}
        <div style={{
          marginTop: 20,
          background: CIVIO.primaryTint,
          border: `1px solid ${CIVIO.primaryContainer}`,
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <Icon name="error" size={18} color={CIVIO.primary} />
          <div style={{ fontSize: 13, color: CIVIO.onPrimaryContainer, lineHeight: 1.4 }}>
            После создания запись ожидает подтверждения от организации.
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button style={{
            width: '100%', height: 52, borderRadius: 100, border: 'none',
            background: CIVIO.primary, color: '#fff',
            fontFamily: CIVIO.font, fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
            boxShadow: '0 6px 20px rgba(79,70,229,.32)',
          }}>Подтвердить запись</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 8 — BookingsScreen
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'Ожидает':       { bg: CIVIO.warningContainer, fg: CIVIO.warning },
    'Подтверждена':  { bg: CIVIO.successContainer, fg: CIVIO.success },
    'Завершена':     { bg: '#ECEDF2', fg: CIVIO.onSurfaceVar },
    'Отменена':      { bg: CIVIO.errorContainer,  fg: CIVIO.error },
  };
  const c = map[status] || map['Завершена'];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, padding: '0 10px', borderRadius: 100,
      background: c.bg, color: c.fg,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.1,
    }}>{status}</div>
  );
}

function BookingCard({ org, service, when, status }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${CIVIO.outlineVariant}`,
      borderRadius: 14,
      padding: '14px 14px 14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 1px 2px rgba(20,20,40,.03)',
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: CIVIO.onSurface, lineHeight: 1.25 }}>{org}</div>
          <StatusBadge status={status} />
        </div>
        <div style={{ fontSize: 13, color: CIVIO.onSurfaceVar }}>{service}</div>
        <div style={{ fontSize: 12, color: CIVIO.onSurfaceMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="calendar" size={12} color={CIVIO.onSurfaceMuted} />
          {when}
        </div>
      </div>
      <Icon name="chevron-right" size={20} color={CIVIO.onSurfaceMuted} />
    </div>
  );
}

function BookingsScreen() {
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Pull-to-refresh hint */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 0' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,.1)',
          }}>
            <Icon name="refresh" size={16} color={CIVIO.primary} />
          </div>
        </div>
        <div style={{ padding: '12px 20px 12px' }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>Мои записи</div>
        </div>
        {/* Filters */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          <Chip label="Все" selected />
          <Chip label="Активные" />
          <Chip label="Завершённые" />
          <Chip label="Отменённые" />
        </div>
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BookingCard org="Студия Civio"        service="Женская стрижка"        when="Пн, 5 мая · 10:00" status="Подтверждена" />
          <BookingCard org="Барбершоп «Север»"   service="Мужская стрижка + борода" when="Ср, 7 мая · 14:30" status="Ожидает" />
          <BookingCard org="Клиника «Здоровье+»" service="Приём терапевта"          when="29 апр · 09:30" status="Завершена" />
          <BookingCard org="Маникюрная «Лак&Лак»" service="Маникюр с покрытием"     when="22 апр · 18:00" status="Отменена" />
        </div>
      </div>
      <BottomNav active="bookings" badges={{ notifications: 3 }} />
    </Phone>
  );
}

Object.assign(window, { BookServiceScreen, SelectSlotScreen, ConfirmBookingScreen, BookingsScreen });
