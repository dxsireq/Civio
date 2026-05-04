// Screens 7-8: Org Dashboard & Employees

const OrgDashboardScreen = () => {
  const recent = [
    { client: 'Мария Иванова', svc: 'Окрашивание', time: 'сегодня · 14:30', status: 'confirmed' },
    { client: 'Ольга Петрова', svc: 'Маникюр гель-лак', time: 'сегодня · 16:00', status: 'pending' },
    { client: 'Елена Смирнова', svc: 'Стрижка + укладка', time: 'сегодня · 17:30', status: 'pending' },
    { client: 'Анна Кузнецова', svc: 'Уход за лицом', time: 'завтра · 11:00', status: 'confirmed' },
    { client: 'Дарья Белова', svc: 'Педикюр', time: 'завтра · 15:00', status: 'completed' },
  ];
  const sBadge = (s) => ({
    pending: <span className="badge badge-pending"><span className="badge-dot"/>Ожидает</span>,
    confirmed: <span className="badge badge-info"><span className="badge-dot"/>Подтверждена</span>,
    completed: <span className="badge badge-approved"><span className="badge-dot"/>Завершена</span>,
  }[s]);

  return (
    <div className="civio">
      <div className="layout">
        <OrgSidebar active="overview" />
        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-soft)' }}>
              <I.home size={14} /> Обзор
            </div>
            <span className="avatar">АС</span>
          </div>

          <div className="page">
            <div className="page-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h1 className="page-title">Студия «Лотос»</h1>
                  <span className="badge badge-approved"><span className="badge-dot"/>Одобрена</span>
                </div>
                <div className="page-subtitle">Москва · ул. Большая Никитская, 14 · работает с 09:00</div>
              </div>
              <button className="btn btn-secondary btn-sm"><I.edit size={13} />Редактировать</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
              {[
                { l: 'Сотрудников', v: 8, d: '+1 за неделю' },
                { l: 'Услуг', v: 22, d: 'из 25 активных' },
                { l: 'Бронирований сегодня', v: 14, d: '4 ожидают подтверждения' },
                { l: 'Выручка за месяц', v: '184 200 ₽', d: '+12% к апрелю' },
              ].map((s, i) => (
                <div key={i} className="stat">
                  <div className="stat-label">{s.l}</div>
                  <div className="stat-value" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                  <div className="stat-delta">{s.d}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 18, alignItems: 'start' }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Информация об организации</h2>
                  <button className="btn btn-ghost btn-sm"><I.edit size={13} />Редактировать</button>
                </div>
                <div className="card-body">
                  <dl className="kv">
                    <dt>Email</dt><dd>info@lotos-studio.ru</dd>
                    <dt>Телефон</dt><dd style={{ fontVariantNumeric: 'tabular-nums' }}>+7 (495) 123-45-67</dd>
                    <dt>Сайт</dt><dd><a style={{ color: 'var(--indigo-700)', textDecoration: 'none' }}>lotos-studio.ru</a></dd>
                    <dt>Адрес</dt><dd>Москва, ул. Большая Никитская, д. 14, стр. 1</dd>
                    <dt>ИНН</dt><dd style={{ fontVariantNumeric: 'tabular-nums' }}>7708123456</dd>
                    <dt>Описание</dt><dd style={{ color: 'var(--text-soft)' }}>Салон красоты в центре Москвы. Команда из 8 мастеров с опытом более 5 лет.</dd>
                  </dl>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Последние записи</h2>
                  <a style={{ fontSize: 13, color: 'var(--indigo-700)', textDecoration: 'none' }}>Все →</a>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {recent.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span className="avatar" style={{ background: '#fce7f3', color: '#9d174d' }}>{r.client.split(' ').map(p => p[0]).join('')}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.client}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{r.svc} · {r.time}</div>
                      </div>
                      {sBadge(r.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeesScreen = () => {
  const emps = [
    { fn: 'Мария', ln: 'Иванова', pos: 'Стилист-колорист', email: 'maria@lotos.ru', phone: '+7 916 555-12-01', active: true, color: '#fce7f3', text: '#9d174d' },
    { fn: 'Дарья', ln: 'Соколова', pos: 'Мастер маникюра', email: 'darya@lotos.ru', phone: '+7 916 555-12-02', active: true, color: '#dbeafe', text: '#1e40af' },
    { fn: 'Кристина', ln: 'Воронова', pos: 'Парикмахер', email: 'kristina@lotos.ru', phone: '+7 916 555-12-03', active: true, color: '#dcfce7', text: '#166534' },
    { fn: 'Алексей', ln: 'Козлов', pos: 'Барбер', email: 'alex@lotos.ru', phone: '+7 916 555-12-04', active: true, color: '#fef3c7', text: '#854d0e' },
    { fn: 'Юлия', ln: 'Новикова', pos: 'Косметолог', email: 'yulia@lotos.ru', phone: '+7 916 555-12-05', active: true, color: '#ede9fe', text: '#5b21b6' },
    { fn: 'Светлана', ln: 'Орлова', pos: 'Мастер педикюра', email: '—', phone: '+7 916 555-12-06', active: false, color: '#f1f5f9', text: '#475569' },
  ];
  return (
    <div className="civio">
      <div className="layout">
        <OrgSidebar active="employees" />
        <div className="main">
          <div className="topbar">
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Студия «Лотос» / Сотрудники</div>
            <span className="avatar">АС</span>
          </div>
          <div className="page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Сотрудники</h1>
                <div className="page-subtitle">8 человек · 5 активных в графике на сегодня</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <I.search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" placeholder="Поиск" style={{ paddingLeft: 32, height: 36 }} />
                </div>
                <button className="btn btn-primary"><I.plus size={14} />Добавить сотрудника</button>
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th>Должность</th>
                    <th>Контакты</th>
                    <th>Услуг</th>
                    <th>Статус</th>
                    <th className="cell-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {emps.map((e, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="avatar" style={{ background: e.color, color: e.text, width: 36, height: 36, fontSize: 13 }}>{e.fn[0]}{e.ln[0]}</span>
                          <div>
                            <div style={{ fontWeight: 500 }}>{e.fn} {e.ln}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID #{(2400 + i).toString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-muted">{e.pos}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>{e.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{e.phone}</div>
                      </td>
                      <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{[6, 4, 5, 3, 7, 2][i]}</td>
                      <td>
                        {e.active
                          ? <span className="badge badge-approved"><span className="badge-dot"/>Активен</span>
                          : <span className="badge badge-neutral"><span className="badge-dot"/>Неактивен</span>}
                      </td>
                      <td className="cell-actions">
                        <button className="btn btn-ghost btn-sm">Открыть<I.chevronRight size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add drawer hint - bottom */}
            <div style={{ marginTop: 14, padding: 14, background: 'var(--indigo-50)', border: '1px solid #c7d2fe', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--indigo-800)' }}>
              <I.info size={14} />
              Сотрудник без аккаунта в системе тоже может быть добавлен — оставьте поле «ID пользователя» пустым.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OrgDashboardScreen, EmployeesScreen });
