// Screens 1-2: Login, Register

const AuthShell = ({ children }) => (
  <div className="civio" style={{ height: '100%', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
    <div style={{ width: '100%', maxWidth: 400 }}>
      {children}
    </div>
  </div>
);

const LoginScreen = () => (
  <AuthShell>
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <span className="civio-logo" style={{ fontSize: 22 }}>
        <span className="civio-logo-mark" style={{ width: 30, height: 30, fontSize: 15 }}>C</span>
        Civio
      </span>
    </div>
    <div className="card" style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Войти в систему</h1>
      <p style={{ color: 'var(--text-soft)', margin: '0 0 24px', fontSize: 14 }}>Управляйте организацией и записями</p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input has-error" type="email" defaultValue="anna@beautysalon.ru" />
          <div className="field-error">
            <I.alertCircle size={13} />
            Неверный email или пароль
          </div>
        </div>

        <div className="field">
          <label className="field-label">Пароль</label>
          <div className="input-group">
            <input className="input" type="password" defaultValue="••••••••••" />
            <button className="input-group-action" type="button" tabIndex={-1}>
              <I.eye size={16} />
            </button>
          </div>
          <a style={{ fontSize: 12, color: 'var(--indigo-700)', textDecoration: 'none', alignSelf: 'flex-end' }}>Забыли пароль?</a>
        </div>

        <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 4 }}>Войти</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-soft)' }}>
        Нет аккаунта? <a style={{ color: 'var(--indigo-700)', fontWeight: 500, textDecoration: 'none' }}>Зарегистрироваться</a>
      </div>
    </div>
    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>© 2026 Civio · Платформа онлайн-записи</p>
  </AuthShell>
);

const RegisterScreen = () => (
  <AuthShell>
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <span className="civio-logo" style={{ fontSize: 22 }}>
        <span className="civio-logo-mark" style={{ width: 30, height: 30, fontSize: 15 }}>C</span>
        Civio
      </span>
    </div>
    <div className="card" style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Создать аккаунт</h1>
      <p style={{ color: 'var(--text-soft)', margin: '0 0 22px', fontSize: 14 }}>Бесплатная регистрация для владельцев бизнеса</p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="field-label">Имя <span className="req">*</span></label>
            <input className="input" defaultValue="Анна" />
          </div>
          <div className="field">
            <label className="field-label">Фамилия <span className="req">*</span></label>
            <input className="input" defaultValue="Соколова" />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Email <span className="req">*</span></label>
          <input className="input" type="email" defaultValue="anna@beautysalon.ru" />
        </div>

        <div className="field">
          <label className="field-label">Телефон</label>
          <input className="input" placeholder="+7 (___) ___-__-__" />
          <div className="field-help">Необязательно — для уведомлений о записях</div>
        </div>

        <div className="field">
          <label className="field-label">Пароль <span className="req">*</span></label>
          <div className="input-group">
            <input className="input" type="password" defaultValue="••••••••" />
            <button className="input-group-action" type="button" tabIndex={-1}><I.eye size={16} /></button>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Подтвердить пароль <span className="req">*</span></label>
          <input className="input" type="password" defaultValue="••••••••" />
        </div>

        <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 6 }}>Зарегистрироваться</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-soft)' }}>
        Уже есть аккаунт? <a style={{ color: 'var(--indigo-700)', fontWeight: 500, textDecoration: 'none' }}>Войти</a>
      </div>
    </div>
  </AuthShell>
);

Object.assign(window, { LoginScreen, RegisterScreen });
