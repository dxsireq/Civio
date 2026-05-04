// Shared layout shells

const TopNav = ({ user = { name: 'Анна Соколова', email: 'anna@beautysalon.ru', initials: 'АС' } }) => (
  <div className="topbar">
    <span className="civio-logo">
      <span className="civio-logo-mark">C</span>
      Civio
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button className="btn btn-ghost btn-sm">
        <I.logout size={14} />
        Выйти
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
        <span className="avatar avatar-lg">{user.initials}</span>
      </div>
    </div>
  </div>
);

const AdminSidebar = ({ active = 'orgs' }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <span className="civio-logo">
        <span className="civio-logo-mark">C</span>
        <span>Civio <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Admin</span></span>
      </span>
    </div>
    <nav className="sidebar-nav">
      <div className="sidebar-nav-section">Модерация</div>
      <a className={'sidebar-link' + (active === 'orgs' ? ' active' : '')}>
        <I.building size={16} />Организации
        <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>3</span>
      </a>
      <a className="sidebar-link"><I.users size={16} />Пользователи</a>
      <a className="sidebar-link"><I.shield size={16} />Жалобы</a>
      <div className="sidebar-nav-section">Система</div>
      <a className="sidebar-link"><I.list size={16} />Журнал действий</a>
      <a className="sidebar-link"><I.info size={16} />Настройки</a>
    </nav>
    <div className="sidebar-foot">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="avatar">МК</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Михаил К.</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Модератор</div>
        </div>
      </div>
    </div>
  </aside>
);

const OrgSidebar = ({ active = 'overview', orgName = 'Студия «Лотос»' }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <span className="civio-logo">
        <span className="civio-logo-mark">C</span>
        <span>Civio</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 10px', background: 'var(--bg-soft)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--indigo-700)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>Л</span>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgName}</span>
        <I.chevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
    <nav className="sidebar-nav">
      <a className={'sidebar-link' + (active === 'overview' ? ' active' : '')}><I.home size={16} />Обзор</a>
      <a className={'sidebar-link' + (active === 'employees' ? ' active' : '')}><I.users size={16} />Сотрудники</a>
      <a className={'sidebar-link' + (active === 'services' ? ' active' : '')}><I.scissors size={16} />Услуги</a>
      <a className={'sidebar-link' + (active === 'bookings' ? ' active' : '')}>
        <I.calendar size={16} />Бронирования
        <span className="badge badge-info" style={{ marginLeft: 'auto' }}>4</span>
      </a>
      <a className={'sidebar-link' + (active === 'scan' ? ' active' : '')}><I.qr size={16} />Сканер QR</a>
    </nav>
    <div className="sidebar-foot">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="avatar">АС</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Анна Соколова</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Владелец</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><I.logout size={14} /></button>
      </div>
    </div>
  </aside>
);

Object.assign(window, { TopNav, AdminSidebar, OrgSidebar });
