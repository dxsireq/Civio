// Screens 3-4: Admin organizations list & detail

const AdminOrgsListScreen = () => {
  const rows = [
    { name: 'Студия «Лотос»', city: 'Москва', owner: 'anna@beautysalon.ru', status: 'pending', date: '02.05.2026' },
    { name: 'Beauty Lab', city: 'Санкт-Петербург', owner: 'm.petrova@beautylab.ru', status: 'pending', date: '01.05.2026' },
    { name: 'Салон «Эстетика»', city: 'Казань', owner: 'estetika.kzn@mail.ru', status: 'pending', date: '30.04.2026' },
    { name: 'Парикмахерская «Volna»', city: 'Москва', owner: 'volna.spb@gmail.com', status: 'approved', date: '28.04.2026' },
    { name: 'Студия маникюра NailUp', city: 'Екатеринбург', owner: 'nailup@inbox.ru', status: 'approved', date: '24.04.2026' },
    { name: 'Барбершоп «Резец»', city: 'Новосибирск', owner: 'rezets.nsk@gmail.com', status: 'approved', date: '20.04.2026' },
    { name: 'Imagine Beauty', city: 'Москва', owner: 'imagine@mail.ru', status: 'rejected', date: '18.04.2026' },
    { name: 'Салон «Грация»', city: 'Краснодар', owner: 'gracia@yandex.ru', status: 'approved', date: '15.04.2026' },
    { name: 'Frizz Studio', city: 'Санкт-Петербург', owner: 'frizz@gmail.com', status: 'blocked', date: '10.04.2026' },
  ];
  const badgeFor = (s) => ({
    pending: <span className="badge badge-pending"><span className="badge-dot"/>На модерации</span>,
    approved: <span className="badge badge-approved"><span className="badge-dot"/>Одобрена</span>,
    rejected: <span className="badge badge-rejected"><span className="badge-dot"/>Отклонена</span>,
    blocked:  <span className="badge badge-blocked"><span className="badge-dot"/>Заблокирована</span>,
  }[s]);

  return (
    <div className="civio">
      <div className="layout">
        <AdminSidebar active="orgs" />
        <div className="main">
          <div className="topbar">
            <div style={{ position: 'relative', width: 320 }}>
              <I.search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Поиск по названию, владельцу, городу" style={{ paddingLeft: 34, height: 36 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="avatar">МК</span>
            </div>
          </div>

          <div className="page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Организации</h1>
                <div className="page-subtitle">Модерация заявок и управление зарегистрированными организациями</div>
              </div>
              <button className="btn btn-secondary btn-sm">
                <I.filter size={14} />Фильтры
              </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '0 16px' }}>
                <div className="tabs">
                  <button className="tab">Все<span className="count">142</span></button>
                  <button className="tab active">На модерации<span className="count">3</span></button>
                  <button className="tab">Одобрены<span className="count">128</span></button>
                  <button className="tab">Отклонены<span className="count">7</span></button>
                  <button className="tab">Заблокированы<span className="count">4</span></button>
                </div>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Город</th>
                    <th>Владелец</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th className="cell-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{r.name}</td>
                      <td className="cell-muted">{r.city}</td>
                      <td className="cell-muted">{r.owner}</td>
                      <td>{badgeFor(r.status)}</td>
                      <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.date}</td>
                      <td className="cell-actions">
                        <button className="btn btn-ghost btn-sm">Открыть<I.chevronRight size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>Показано 1–9 из 142</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" disabled>← Назад</button>
                  <button className="btn btn-secondary btn-sm" style={{ minWidth: 32 }}>1</button>
                  <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>2</button>
                  <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>3</button>
                  <span style={{ padding: '0 8px', color: 'var(--text-muted)', alignSelf: 'center' }}>…</span>
                  <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>16</button>
                  <button className="btn btn-ghost btn-sm">Вперёд →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrgDetailScreen = () => (
  <div className="civio">
    <div className="layout">
      <AdminSidebar active="orgs" />
      <div className="main">
        <div className="topbar">
          <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>Модерация · Карточка организации</span>
          <span className="avatar">МК</span>
        </div>

        <div className="page">
          <a className="crumb"><I.arrowLeft size={14} />Организации</a>

          <div className="page-header">
            <div>
              <h1 className="page-title">Студия «Лотос»</h1>
              <div className="page-subtitle">Заявка на регистрацию · ID 1432</div>
            </div>
            <span className="badge badge-pending" style={{ fontSize: 13, padding: '4px 12px' }}>
              <span className="badge-dot" />На модерации
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>
            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header"><h2 className="card-title">Основная информация</h2></div>
                <div className="card-body">
                  <dl className="kv">
                    <dt>Название</dt><dd>Студия «Лотос»</dd>
                    <dt>Юридическое название</dt><dd>ООО «Лотос Бьюти»</dd>
                    <dt>ИНН</dt><dd style={{ fontVariantNumeric: 'tabular-nums' }}>7708123456</dd>
                    <dt>Описание</dt>
                    <dd style={{ color: 'var(--text-soft)' }}>Салон красоты в центре Москвы. Стрижки, окрашивание, маникюр, педикюр, уход за лицом. Команда из 8 мастеров с опытом более 5 лет.</dd>
                  </dl>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2 className="card-title">Контакты и адрес</h2></div>
                <div className="card-body">
                  <dl className="kv">
                    <dt>Город</dt><dd>Москва</dd>
                    <dt>Адрес</dt><dd>ул. Большая Никитская, д. 14, стр. 1</dd>
                    <dt>Email</dt><dd>info@lotos-studio.ru</dd>
                    <dt>Телефон</dt><dd style={{ fontVariantNumeric: 'tabular-nums' }}>+7 (495) 123-45-67</dd>
                    <dt>Сайт</dt><dd><a style={{ color: 'var(--indigo-700)', textDecoration: 'none' }}>lotos-studio.ru</a></dd>
                  </dl>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2 className="card-title">Владелец</h2></div>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="avatar avatar-lg">АС</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>Анна Соколова</div>
                    <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>anna@beautysalon.ru · +7 (916) 555-12-34</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Зарегистрирован 02.05.2026</div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
              <div className="card">
                <div className="card-header"><h2 className="card-title">Решение</h2></div>
                <div className="card-body">
                  <div className="field">
                    <label className="field-label">Комментарий модератора</label>
                    <textarea className="textarea" placeholder="Будет отправлен владельцу. Необязательно для одобрения, обязательно для отклонения." rows={4} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-success btn-block"><I.check size={15} />Одобрить</button>
                    <button className="btn btn-danger btn-block"><I.x size={15} />Отклонить</button>
                    <button className="btn btn-dark btn-block">Заблокировать</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2 className="card-title">История модерации</h2></div>
                <div className="card-body">
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot" style={{ borderColor: '#fdba74', background: '#fff7ed' }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#f97316' }} />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-meta">02.05.2026 · 14:32</div>
                        <div className="timeline-row">
                          <strong>Анна Соколова</strong>
                          <span className="badge badge-neutral">Создана</span>
                          <I.arrowRight size={11} style={{ color: 'var(--text-muted)' }} />
                          <span className="badge badge-pending"><span className="badge-dot"/>На модерации</span>
                        </div>
                        <div className="timeline-comment">Заявка отправлена</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-muted)' }} /></div>
                      <div className="timeline-content">
                        <div className="timeline-meta">Ожидает решения модератора</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { AdminOrgsListScreen, AdminOrgDetailScreen });
