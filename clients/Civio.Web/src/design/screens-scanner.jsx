// Screen 13: QR Scanner — 3 states

const ScannerShell = ({ children, hint }) => (
  <div className="civio">
    <div className="layout">
      <OrgSidebar active="scan" />
      <div className="main">
        <div className="topbar">
          <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Студия «Лотос» / Сканер QR</div>
          <span className="avatar">АС</span>
        </div>
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100% - 60px)' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ marginBottom: 22 }}>
              <h1 className="page-title">Сканер QR</h1>
              <div className="page-subtitle">{hint}</div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Corners overlay for camera viewfinder
const CornerMarkers = () => {
  const c = '#fff';
  const sw = 3;
  const len = 24;
  const Corner = ({ style }) => (
    <div style={{ position: 'absolute', width: len, height: len, ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: len, height: sw, background: c, borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: sw, height: len, background: c, borderRadius: 2 }} />
    </div>
  );
  return (
    <>
      <Corner style={{ top: 18, left: 18 }} />
      <Corner style={{ top: 18, right: 18, transform: 'rotate(90deg)' }} />
      <Corner style={{ bottom: 18, right: 18, transform: 'rotate(180deg)' }} />
      <Corner style={{ bottom: 18, left: 18, transform: 'rotate(270deg)' }} />
    </>
  );
};

const ScannerScanningScreen = () => (
  <ScannerShell hint="Подтверждение визита по QR-коду из приложения клиента">
    <div className="card" style={{ padding: 24 }}>
      <div style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        overflow: 'hidden',
      }}>
        {/* Simulated camera grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'repeating-linear-gradient(0deg, transparent 0 22px, rgba(255,255,255,.4) 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,.4) 22px 23px)' }} />
        {/* Scanning area */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', aspectRatio: '1', border: '1px dashed rgba(255,255,255,.4)', borderRadius: 12 }}>
          <CornerMarkers />
          {/* Scan line */}
          <div style={{ position: 'absolute', left: 24, right: 24, top: '50%', height: 2, background: 'linear-gradient(90deg, transparent, #818cf8, transparent)', boxShadow: '0 0 8px #818cf8' }} />
        </div>
        {/* Hint */}
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.85)', fontSize: 13 }}>
          Наведите камеру на QR-код клиента
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--bg-soft)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-soft)' }}>
        <I.info size={14} style={{ color: 'var(--indigo-600)' }} />
        Если камера не запустилась автоматически — разрешите доступ в настройках браузера.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
        <button className="btn btn-secondary"><I.camera size={14} />Сменить камеру</button>
        <button className="btn btn-ghost">Ввести код вручную</button>
      </div>
    </div>
  </ScannerShell>
);

const ScannerSuccessScreen = () => (
  <ScannerShell hint="Результат сканирования">
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '36px 28px 28px', textAlign: 'center', background: 'linear-gradient(180deg, #ecfdf5 0%, white 100%)', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36, background: '#10b981',
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 8px 24px rgba(16, 185, 129, .35)',
        }}>
          <I.check size={36} sw={2.5} />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Визит подтверждён</h2>
        <div style={{ color: 'var(--text-soft)', fontSize: 14 }}>Клиент отмечен как пришедший</div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <span className="avatar avatar-lg" style={{ background: '#fce7f3', color: '#9d174d' }}>МИ</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Мария Иванова</div>
            <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>m.ivanova@mail.ru</div>
          </div>
        </div>

        <dl className="kv" style={{ marginTop: 18, gridTemplateColumns: '110px 1fr' }}>
          <dt>Услуга</dt><dd style={{ fontWeight: 500 }}>Окрашивание (1 тон)</dd>
          <dt>Сотрудник</dt><dd>Мария Иванова</dd>
          <dt>Время</dt><dd style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>4 мая 2026 · 14:30 – 16:30</dd>
          <dt>К оплате</dt><dd style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>5 500 ₽</dd>
        </dl>

        <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          <button className="btn btn-primary btn-block"><I.qr size={15} />Сканировать следующий</button>
          <button className="btn btn-secondary">Открыть запись</button>
        </div>
      </div>
    </div>
  </ScannerShell>
);

const ScannerErrorScreen = () => (
  <ScannerShell hint="Результат сканирования">
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '36px 28px 28px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, white 100%)', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36, background: '#ef4444',
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 8px 24px rgba(239, 68, 68, .35)',
        }}>
          <I.x size={36} sw={2.5} />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>QR-код уже использован</h2>
        <div style={{ color: 'var(--text-soft)', fontSize: 14, maxWidth: 380, margin: '0 auto' }}>Этот код был просканирован 03.05.2026 в 11:42. Каждый код можно использовать только один раз.</div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ background: 'var(--bg-soft)', borderRadius: 'var(--r)', padding: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8 }}>Возможные причины</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.8 }}>
            <li>Код уже был использован при предыдущем визите</li>
            <li>Срок действия истёк (более 24 часов после окончания)</li>
            <li>Запись была отменена клиентом</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button className="btn btn-primary btn-block"><I.rotate size={15} />Попробовать снова</button>
          <button className="btn btn-secondary">Найти запись</button>
        </div>
      </div>
    </div>
  </ScannerShell>
);

Object.assign(window, { ScannerScanningScreen, ScannerSuccessScreen, ScannerErrorScreen });
