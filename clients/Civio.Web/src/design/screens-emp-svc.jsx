// Screens 9-10: Employee detail & Services

const EmployeeDetailScreen = () => {
  const [tab, setTab] = React.useState('data');
  const services = [
    { name: 'Стрижка женская', dur: 60, price: 2500 },
    { name: 'Окрашивание (1 тон)', dur: 120, price: 5500 },
    { name: 'Тонирование', dur: 90, price: 3800 },
    { name: 'Укладка', dur: 45, price: 1800 },
  ];
  const days = [
    { date: '05.05.2026', day: 'Вт', start: '10:00', end: '20:00', breakFrom: '14:00', breakTo: '15:00' },
    { date: '07.05.2026', day: 'Чт', start: '10:00', end: '20:00', breakFrom: '14:00', breakTo: '15:00' },
    { date: '08.05.2026', day: 'Пт', start: '12:00', end: '21:00', breakFrom: '16:00', breakTo: '16:30' },
    { date: '10.05.2026', day: 'Вс', start: '11:00', end: '18:00', breakFrom: '—', breakTo: '—' },
  ];

  return (
    <div className="civio">
      <div className="layout">
        <OrgSidebar active="employees" />
        <div className="main">
          <div className="topbar">
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Студия «Лотос» / Сотрудники / Мария Иванова</div>
            <span className="avatar">АС</span>
          </div>
          <div className="page">
            <a className="crumb"><I.arrowLeft size={14} />Сотрудники</a>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span className="avatar" style={{ background: '#fce7f3', color: '#9d174d', width: 56, height: 56, fontSize: 18 }}>МИ</span>
              <div style={{ flex: 1 }}>
                <h1 className="page-title">Мария Иванова</h1>
                <div className="page-subtitle">Стилист-колорист · в команде с января 2024</div>
              </div>
              <button className="btn btn-secondary btn-sm"><I.trash size={13} />Удалить</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '0 20px' }}>
                <div className="tabs">
                  <button className={'tab' + (tab === 'data' ? ' active' : '')} onClick={() => setTab('data')}>Данные</button>
                  <button className={'tab' + (tab === 'svc' ? ' active' : '')} onClick={() => setTab('svc')}>Услуги <span className="count">4</span></button>
                  <button className={'tab' + (tab === 'days' ? ' active' : '')} onClick={() => setTab('days')}>Рабочие дни</button>
                </div>
              </div>

              {tab === 'data' && (
                <div style={{ padding: 24, maxWidth: 720 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="field"><label className="field-label">Имя</label><input className="input" defaultValue="Мария" /></div>
                    <div className="field"><label className="field-label">Фамилия</label><input className="input" defaultValue="Иванова" /></div>
                    <div className="field"><label className="field-label">Отчество</label><input className="input" defaultValue="Сергеевна" /></div>
                    <div className="field"><label className="field-label">Должность</label><input className="input" defaultValue="Стилист-колорист" /></div>
                    <div className="field"><label className="field-label">Телефон</label><input className="input" defaultValue="+7 (916) 555-12-01" /></div>
                    <div className="field"><label className="field-label">Email</label><input className="input" defaultValue="maria@lotos.ru" /></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
                    <button className="btn btn-ghost">Отмена</button>
                    <button className="btn btn-primary">Сохранить</button>
                  </div>
                </div>
              )}

              {tab === 'svc' && (
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <select className="select" defaultValue="" style={{ maxWidth: 300 }}>
                      <option value="" disabled>Выберите услугу из списка организации…</option>
                      <option>Маникюр гель-лак</option>
                      <option>Уход за лицом «Базовый»</option>
                    </select>
                    <button className="btn btn-primary"><I.plus size={14} />Добавить</button>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                    <table className="table">
                      <thead><tr><th>Услуга</th><th>Длительность</th><th>Цена</th><th></th></tr></thead>
                      <tbody>
                        {services.map((s, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{s.name}</td>
                            <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.dur} мин</td>
                            <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.price.toLocaleString('ru-RU')} ₽</td>
                            <td className="cell-actions">
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }}><I.x size={13} />Убрать</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'days' && (
                <div style={{ padding: 24 }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 14 }}>
                    <table className="table">
                      <thead><tr><th>Дата</th><th>День</th><th>Начало</th><th>Конец</th><th>Перерыв</th><th></th></tr></thead>
                      <tbody>
                        {days.map((d, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{d.date}</td>
                            <td className="cell-muted">{d.day}</td>
                            <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.start}</td>
                            <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.end}</td>
                            <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.breakFrom !== '—' ? `${d.breakFrom}–${d.breakTo}` : '—'}</td>
                            <td className="cell-actions">
                              <button className="btn btn-ghost btn-sm"><I.edit size={13} /></button>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }}><I.trash size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: 16, background: 'var(--bg-soft)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>+ Добавить рабочий день</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: 8, alignItems: 'end' }}>
                      <div className="field"><label className="field-label">Дата</label><input className="input" type="date" defaultValue="2026-05-12" /></div>
                      <div className="field"><label className="field-label">Начало</label><input className="input" type="time" defaultValue="10:00" /></div>
                      <div className="field"><label className="field-label">Конец</label><input className="input" type="time" defaultValue="20:00" /></div>
                      <div className="field"><label className="field-label">Перерыв с</label><input className="input" type="time" defaultValue="14:00" /></div>
                      <div className="field"><label className="field-label">до</label><input className="input" type="time" defaultValue="15:00" /></div>
                      <button className="btn btn-primary">Добавить</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesScreen = () => {
  const services = [
    { cat: 'Волосы', name: 'Стрижка женская', desc: 'Стрижка любой сложности с мытьём и укладкой', dur: 60, price: 2500, active: true },
    { cat: 'Волосы', name: 'Стрижка мужская', desc: 'Стрижка машинкой и ножницами', dur: 45, price: 1800, active: true },
    { cat: 'Волосы', name: 'Окрашивание (1 тон)', desc: 'Окрашивание в один тон, профессиональные краски', dur: 120, price: 5500, active: true },
    { cat: 'Волосы', name: 'Сложное окрашивание', desc: 'Балаяж, шатуш, мелирование — стоимость от длины', dur: 240, price: 9500, active: true },
    { cat: 'Маникюр', name: 'Маникюр классический', desc: 'Аппаратный маникюр с покрытием базой', dur: 60, price: 1500, active: true },
    { cat: 'Маникюр', name: 'Маникюр гель-лак', desc: 'Маникюр + покрытие гель-лаком до 3 недель', dur: 90, price: 2400, active: true },
    { cat: 'Лицо', name: 'Уход «Базовый»', desc: 'Чистка, тонизация, маска по типу кожи', dur: 60, price: 3200, active: true },
    { cat: 'Лицо', name: 'Пилинг химический', desc: 'Курс рекомендуется осенью и зимой', dur: 75, price: 4500, active: false },
  ];

  return (
    <div className="civio">
      <div className="layout">
        <OrgSidebar active="services" />
        <div className="main">
          <div className="topbar">
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Студия «Лотос» / Услуги</div>
            <span className="avatar">АС</span>
          </div>
          <div className="page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Услуги</h1>
                <div className="page-subtitle">22 услуги в каталоге · 3 категории</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="select" style={{ height: 36, width: 180 }}>
                  <option>Все категории</option><option>Волосы</option><option>Маникюр</option><option>Лицо</option>
                </select>
                <button className="btn btn-primary"><I.plus size={14} />Добавить услугу</button>
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Категория</th>
                    <th>Название</th>
                    <th>Длительность</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th className="cell-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={i} style={{ opacity: s.active ? 1 : 0.55 }}>
                      <td><span className="badge badge-neutral">{s.cat}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</div>
                      </td>
                      <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <I.clock size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{s.dur} мин
                      </td>
                      <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.price.toLocaleString('ru-RU')} ₽</td>
                      <td>
                        {s.active
                          ? <span className="badge badge-approved"><span className="badge-dot"/>Активна</span>
                          : <span className="badge badge-neutral"><span className="badge-dot"/>Неактивна</span>}
                      </td>
                      <td className="cell-actions">
                        <button className="btn btn-ghost btn-sm"><I.edit size={13} /></button>
                        {s.active
                          ? <button className="btn btn-ghost btn-sm">Деактивировать</button>
                          : <button className="btn btn-ghost btn-sm" style={{ color: 'var(--green-700)' }}>Активировать</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { EmployeeDetailScreen, ServicesScreen });
