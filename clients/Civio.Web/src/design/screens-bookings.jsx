// Screens 11-12: Bookings list & Booking detail

const BookingsScreen = () => {
  const bookings = [
    { client: 'Мария Иванова', email: 'm.ivanova@mail.ru', svc: 'Окрашивание (1 тон)', emp: 'Мария Иванова', dt: '04.05.2026 · 14:30–16:30', status: 'pending' },
    { client: 'Ольга Петрова', email: 'o.petrova@gmail.com', svc: 'Маникюр гель-лак', emp: 'Дарья Соколова', dt: '04.05.2026 · 16:00–17:30', status: 'pending' },
    { client: 'Елена Смирнова', email: 'e.smirnova@yandex.ru', svc: 'Стрижка + укладка', emp: 'Кристина Воронова', dt: '04.05.2026 · 17:30–18:30', status: 'pending' },
    { client: 'Анна Кузнецова', email: 'a.kuz@mail.ru', svc: 'Уход за лицом', emp: 'Юлия Новикова', dt: '05.05.2026 · 11:00–12:00', status: 'confirmed' },
    { client: 'Дарья Белова', email: 'd.belova@mail.ru', svc: 'Педикюр', emp: 'Светлана Орлова', dt: '05.05.2026 · 15:00–16:30', status: 'confirmed' },
    { client: 'Виктория Жукова', email: 'v.zhukova@inbox.ru', svc: 'Сложное окрашивание', emp: 'Мария Иванова', dt: '03.05.2026 · 12:00–16:00', status: 'completed' },
    { client: 'Полина Лебедева', email: 'p.lebed@mail.ru', svc: 'Стрижка женская', emp: 'Кристина Воронова', dt: '02.05.2026 · 14:00–15:00', status: 'completed' },
    { client: 'Ирина Морозова', email: 'i.moroz@gmail.com', svc: 'Маникюр гель-лак', emp: 'Дарья Соколова', dt: '02.05.2026 · 11:00–12:30', status: 'cancelled' },
    { client: 'Татьяна Зайцева', email: 't.zaitseva@mail.ru', svc: 'Тонирование', emp: 'Мария Иванова', dt: '01.05.2026 · 16:00–17:30', status: 'rejected' },
  ];
  const sBadge = (s) => ({
    pending: <span className="badge badge-pending"><span className="badge-dot"/>Создана</span>,
    confirmed: <span className="badge badge-info"><span className="badge-dot"/>Подтверждена</span>,
    completed: <span className="badge badge-approved"><span className="badge-dot"/>Завершена</span>,
    cancelled: <span className="badge badge-blocked"><span className="badge-dot"/>Отменена</span>,
    rejected: <span className="badge badge-rejected"><span className="badge-dot"/>Отклонена</span>,
  }[s]);

  return (
    <div className="civio">
      <div className="layout">
        <OrgSidebar active="bookings" />
        <div className="main">
          <div className="topbar">
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Студия «Лотос» / Бронирования</div>
            <span className="avatar">АС</span>
          </div>
          <div className="page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Бронирования</h1>
                <div className="page-subtitle">86 записей за последние 30 дней · 4 ожидают подтверждения</div>
              </div>
              <button className="btn btn-secondary btn-sm"><I.calendar size={13} />Экспорт</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '0 16px' }}>
                <div className="tabs">
                  <button className="tab active">Все<span className="count">86</span></button>
                  <button className="tab">Создана<span className="count">4</span></button>
                  <button className="tab">Подтверждена<span className="count">12</span></button>
                  <button className="tab">Завершена<span className="count">62</span></button>
                  <button className="tab">Отменена<span className="count">5</span></button>
                  <button className="tab">Отклонена<span className="count">3</span></button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <I.search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" placeholder="Поиск по клиенту" style={{ paddingLeft: 32, height: 32, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-soft)' }}>
                  <I.calendar size={13} />
                  <input className="input" type="date" defaultValue="2026-04-29" style={{ height: 32, fontSize: 13, width: 140 }} />
                  <span>—</span>
                  <input className="input" type="date" defaultValue="2026-05-05" style={{ height: 32, fontSize: 13, width: 140 }} />
                </div>
                <select className="select" defaultValue="" style={{ height: 32, fontSize: 13, width: 180 }}>
                  <option value="">Все сотрудники</option>
                  <option>Мария Иванова</option>
                  <option>Дарья Соколова</option>
                </select>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Услуга</th>
                    <th>Сотрудник</th>
                    <th>Дата и время</th>
                    <th>Статус</th>
                    <th className="cell-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.client}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.email}</div>
                      </td>
                      <td className="cell-muted">{b.svc}</td>
                      <td className="cell-muted">{b.emp}</td>
                      <td className="cell-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{b.dt}</td>
                      <td>{sBadge(b.status)}</td>
                      <td className="cell-actions">
                        {b.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            <button className="btn btn-success btn-sm"><I.check size={12} />Подтвердить</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }}><I.x size={12} />Отклонить</button>
                          </div>
                        ) : (
                          <button className="btn btn-ghost btn-sm">Открыть<I.chevronRight size={13} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>Показано 1–9 из 86</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" disabled>← Назад</button>
                  <button className="btn btn-secondary btn-sm" style={{ minWidth: 32 }}>1</button>
                  <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>2</button>
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

const BookingDetailScreen = () => (
  <div className="civio">
    <div className="layout">
      <OrgSidebar active="bookings" />
      <div className="main">
        <div className="topbar">
          <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Бронирования / #B-2026-0432</div>
          <span className="avatar">АС</span>
        </div>
        <div className="page">
          <a className="crumb"><I.arrowLeft size={14} />Бронирования</a>

          <div className="page-header">
            <div>
              <h1 className="page-title">Запись #B-2026-0432</h1>
              <div className="page-subtitle">Создана 03.05.2026 в 09:14</div>
            </div>
            <span className="badge badge-pending" style={{ fontSize: 13, padding: '4px 12px' }}>
              <span className="badge-dot" />Ожидает подтверждения
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>
            {/* LEFT */}
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0 }}>
                {/* Client */}
                <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="avatar avatar-lg" style={{ background: '#fce7f3', color: '#9d174d' }}>МИ</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Клиент</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Мария Иванова</div>
                    <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 2 }}>m.ivanova@mail.ru · +7 (916) 123-45-67</div>
                  </div>
                </div>

                {/* Service */}
                <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8 }}>Услуга</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>Окрашивание (1 тон)</div>
                      <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 2 }}>Длительность 120 мин · категория «Волосы»</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>5 500 ₽</div>
                  </div>
                </div>

                {/* Employee */}
                <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="avatar" style={{ background: '#dbeafe', color: '#1e40af' }}>МИ</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Сотрудник</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Мария Иванова — Стилист-колорист</div>
                  </div>
                </div>

                {/* Date */}
                <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8 }}>Дата и время</div>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>4 мая 2026 · 14:30 – 16:30</div>
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 4 }}>Понедельник · через 1 день</div>
                </div>

                {/* Comment */}
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8 }}>Комментарий клиента</div>
                  <div style={{ fontSize: 14, color: 'var(--text)', padding: '12px 14px', background: 'var(--bg-soft)', borderRadius: 'var(--r)', fontStyle: 'italic' }}>
                    «Хочу немного теплее предыдущего раза, базовый тон 7.3. Аллергии нет.»
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 12 }}>Подтвердите запись, чтобы клиент получил уведомление и QR-код для входа.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-success btn-block"><I.check size={15} />Подтвердить</button>
                    <button className="btn btn-secondary btn-block" style={{ color: 'var(--red-600)', borderColor: '#fecaca' }}><I.x size={15} />Отклонить</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2 className="card-title">История статусов</h2></div>
                <div className="card-body">
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot" style={{ borderColor: '#fdba74', background: '#fff7ed' }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#f97316' }} />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-meta">03.05.2026 · 09:14</div>
                        <div className="timeline-row">
                          <strong>Мария Иванова</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(клиент)</span>
                        </div>
                        <div className="timeline-row">
                          <span className="badge badge-neutral">—</span>
                          <I.arrowRight size={11} style={{ color: 'var(--text-muted)' }} />
                          <span className="badge badge-pending"><span className="badge-dot"/>Создана</span>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-muted)' }} /></div>
                      <div className="timeline-content">
                        <div className="timeline-meta">Ожидает подтверждения</div>
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

Object.assign(window, { BookingsScreen, BookingDetailScreen });
