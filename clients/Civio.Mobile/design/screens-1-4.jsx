// screens-1-4.jsx — Login, Register, Catalog, Org Detail

// ─────────────────────────────────────────────────────────────
// Screen 1 — LoginScreen
// ─────────────────────────────────────────────────────────────
function LoginScreen() {
  return (
    <Phone>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px', overflow: 'auto' }}>
        {/* Top: logo + wordmark */}
        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <LogoMark size={72} />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5, color: CIVIO.onSurface }}>Civio</div>
        </div>

        {/* Heading */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: CIVIO.onSurface, lineHeight: 1.2 }}>Войти в систему</div>
          <div style={{ marginTop: 6, fontSize: 14, color: CIVIO.onSurfaceVar }}>Запись на услуги онлайн</div>
        </div>

        {/* Form */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TextField label="Email" value="alex@civio.test" error="Неверный email или пароль" />
          <TextField
            label="Пароль"
            value="qwerty12"
            type="password"
            trailing={<Icon name="eye" size={22} color={CIVIO.onSurfaceVar} />}
          />
        </div>

        {/* Primary button */}
        <div style={{ marginTop: 32 }}>
          <button style={{
            width: '100%', height: 48, borderRadius: 100, border: 'none',
            background: CIVIO.primary, color: '#fff',
            fontFamily: CIVIO.font, fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
            boxShadow: '0 2px 8px rgba(79,70,229,.28)',
          }}>Войти</button>
        </div>

        {/* Register link */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: CIVIO.onSurfaceVar }}>
          Нет аккаунта? <span style={{ color: CIVIO.primary, fontWeight: 600 }}>Зарегистрироваться</span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ textAlign: 'center', fontSize: 12, color: CIVIO.onSurfaceMuted, paddingTop: 16 }}>
          © 2026 Civio
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — RegisterScreen
// ─────────────────────────────────────────────────────────────
function RegisterScreen() {
  return (
    <Phone>
      <TopBar title="Создать аккаунт" />
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TextField label="Имя" value="" required error="Обязательное поле" />
          <TextField label="Фамилия" value="Сидоров" required />
          <TextField label="Email" value="alex.sidorov@mail.ru" required />
          <TextField
            label="Телефон"
            value=""
            placeholder="+7 (___) ___-__-__"
            helper="Необязательно"
          />
          <TextField
            label="Пароль"
            value="strongpass1"
            type="password"
            required
            trailing={<Icon name="eye-off" size={22} color={CIVIO.onSurfaceVar} />}
          />
        </div>

        <div style={{ marginTop: 32 }}>
          <button style={{
            width: '100%', height: 48, borderRadius: 100, border: 'none',
            background: CIVIO.primary, color: '#fff',
            fontFamily: CIVIO.font, fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
            boxShadow: '0 2px 8px rgba(79,70,229,.28)',
          }}>Зарегистрироваться</button>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: CIVIO.onSurfaceVar, paddingBottom: 16 }}>
          Уже есть аккаунт? <span style={{ color: CIVIO.primary, fontWeight: 600 }}>Войти</span>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — OrganizationsScreen (Catalog)
// ─────────────────────────────────────────────────────────────
function OrgCard({ name, city, addr, desc, chip, accent }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${CIVIO.outlineVariant}`,
      borderLeft: accent ? `3px solid ${CIVIO.primary}` : `1px solid ${CIVIO.outlineVariant}`,
      padding: '16px',
      boxShadow: '0 1px 2px rgba(20,20,40,.04)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: CIVIO.onSurface, lineHeight: 1.25, flex: 1 }}>
          {name}
        </div>
        <Chip label={chip} selected variant="filled" size="sm" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: CIVIO.onSurfaceVar }}>
        <Icon name="pin" size={14} color={CIVIO.onSurfaceMuted} />
        <span>{city} · {addr}</span>
      </div>
      <div style={{
        fontSize: 13, color: CIVIO.onSurfaceMuted, lineHeight: 1.45,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{desc}</div>
    </div>
  );
}

function OrganizationsScreen() {
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <div style={{ flex: 1, overflow: 'auto', background: CIVIO.surfaceDim }}>
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

        <div style={{ padding: '12px 20px 16px' }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>Каталог</div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 48, borderRadius: 24,
            background: '#fff',
            border: `1px solid ${CIVIO.outlineVariant}`,
            padding: '0 16px',
          }}>
            <Icon name="search" size={20} color={CIVIO.onSurfaceVar} />
            <span style={{ flex: 1, fontSize: 15, color: CIVIO.onSurfaceMuted }}>Поиск организации...</span>
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OrgCard
            name="Студия Civio"
            city="Москва"
            addr="Никольская, 12"
            desc="Современная студия красоты в самом центре. Стрижки, окрашивание, уход и спа-процедуры."
            chip="8 услуг"
            accent
          />
          <OrgCard
            name="Барбершоп «Север»"
            city="Москва"
            addr="Тверская, 7"
            desc="Мужской барбершоп с авторскими стрижками. Кофе и виски в подарок постоянным клиентам."
            chip="Барбершоп"
          />
          <OrgCard
            name="Клиника «Здоровье+»"
            city="Санкт-Петербург"
            addr="Невский пр., 84"
            desc="Терапия, ЛОР, кардиология. Приём ведут врачи высшей категории по записи."
            chip="12 услуг"
          />
          <OrgCard
            name="Маникюрная «Лак&Лак»"
            city="Москва"
            addr="Большая Дмитровка, 23"
            desc="Маникюр, педикюр, наращивание. Мастер выезжает на дом по предварительной записи."
            chip="Ногти"
          />
        </div>
      </div>
      <BottomNav active="catalog" badges={{ notifications: 3 }} />
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — OrganizationDetailScreen
// ─────────────────────────────────────────────────────────────
function ServiceRow({ name, dur, price, desc }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: `1px solid ${CIVIO.outlineVariant}`,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 2px rgba(20,20,40,.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: CIVIO.onSurface, lineHeight: 1.3 }}>{name}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: CIVIO.primary, whiteSpace: 'nowrap' }}>{price}</div>
      </div>
      <div style={{ fontSize: 13, color: CIVIO.onSurfaceMuted, lineHeight: 1.4 }}>{desc}</div>
      <div>
        <Chip label={dur} size="sm" leading={<Icon name="clock" size={13} color={CIVIO.onSurfaceVar} />} />
      </div>
    </div>
  );
}

function OrganizationDetailScreen() {
  return (
    <Phone bg={CIVIO.surfaceDim}>
      <TopBar title="Студия Civio" />
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', paddingBottom: 96 }}>
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, color: CIVIO.onSurface, lineHeight: 1.15 }}>
            Студия Civio
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: CIVIO.onSurfaceVar, fontSize: 13 }}>
              <Icon name="pin" size={16} color={CIVIO.primary} />
              <span>Москва · Никольская, 12</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: CIVIO.onSurfaceVar, fontSize: 13 }}>
              <Icon name="phone" size={16} color={CIVIO.primary} />
              <span>+7 (495) 123-45-67</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: CIVIO.onSurfaceVar, fontSize: 13 }}>
              <Icon name="mail" size={16} color={CIVIO.primary} />
              <span>hello@studiocivio.ru</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: CIVIO.outlineVariant, margin: '20px 20px 16px' }} />

        <div style={{ padding: '0 20px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: CIVIO.onSurfaceMuted, textTransform: 'uppercase' }}>
          Услуги
        </div>

        <div style={{ padding: '12px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ServiceRow
            name="Женская стрижка"
            dur="60 мин"
            price="1 500 ₽"
            desc="Мытьё, стрижка, укладка. Подходит для волос любой длины."
          />
          <ServiceRow
            name="Окрашивание в один тон"
            dur="120 мин"
            price="3 800 ₽"
            desc="Стойкая краска премиум-класса, уход после окрашивания включён."
          />
          <ServiceRow
            name="Уходовый комплекс"
            dur="45 мин"
            price="2 200 ₽"
            desc="Глубокое восстановление и питание. Эффект заметен сразу."
          />
        </div>
      </div>

      {/* Pinned action */}
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
        }}>Записаться</button>
      </div>
    </Phone>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen, OrganizationsScreen, OrganizationDetailScreen });
