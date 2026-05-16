CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- USERS / ROLES
-- =========================

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(30),
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================
-- ORGANIZATIONS
-- =========================

CREATE TABLE organization_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    address         TEXT NOT NULL,
    description     TEXT,
    email           VARCHAR(255),
    phone           VARCHAR(30),
    website         VARCHAR(255),
    legal_name      VARCHAR(255),
    inn             VARCHAR(20),
    status_id       UUID NOT NULL REFERENCES organization_statuses(id),
    owner_user_id   UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE organization_moderation_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    moderator_id    UUID REFERENCES users(id),
    old_status_id   UUID REFERENCES organization_statuses(id),
    new_status_id   UUID NOT NULL REFERENCES organization_statuses(id),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- EMPLOYEES / SERVICES
-- =========================

CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    position        VARCHAR(150),
    phone           VARCHAR(30),
    email           VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE service_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price           NUMERIC(10, 2) CHECK (price >= 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE employee_services (
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, service_id)
);

-- =========================
-- SCHEDULES / SLOTS
-- =========================

CREATE TABLE slot_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE schedule_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    break_start     TIME,
    break_end       TIME,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (start_time < end_time),
    CHECK (
        break_start IS NULL
        OR break_end IS NULL
        OR break_start < break_end
    )
);

CREATE TABLE work_days (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    break_start     TIME,
    break_end       TIME,
    is_working      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    CHECK (start_time < end_time),
    CHECK (
        break_start IS NULL
        OR break_end IS NULL
        OR break_start < break_end
    ),
    UNIQUE (employee_id, work_date)
);

CREATE TABLE booking_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
    work_day_id     UUID REFERENCES work_days(id) ON DELETE CASCADE,
    status_id       UUID NOT NULL REFERENCES slot_statuses(id),
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (start_at < end_at),
    UNIQUE (employee_id, start_at, end_at)
);

-- =========================
-- BOOKINGS
-- =========================

CREATE TABLE booking_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id      UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    employee_id     UUID REFERENCES employees(id),
    service_id      UUID NOT NULL REFERENCES services(id),
    slot_id         UUID REFERENCES booking_slots(id),
    status_id       UUID NOT NULL REFERENCES booking_statuses(id),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE booking_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status_id   UUID REFERENCES booking_statuses(id),
    new_status_id   UUID NOT NULL REFERENCES booking_statuses(id),
    changed_by_id   UUID REFERENCES users(id),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_qr_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE notification_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE notification_channels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE notification_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    type_id         UUID NOT NULL REFERENCES notification_types(id),
    channel_id      UUID NOT NULL REFERENCES notification_channels(id),
    status_id       UUID NOT NULL REFERENCES notification_statuses(id),
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ
);

CREATE TABLE device_push_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    platform        VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_organizations_status_id ON organizations(status_id);
CREATE INDEX idx_organizations_owner_user_id ON organizations(owner_user_id);

CREATE INDEX idx_employees_organization_id ON employees(organization_id);

CREATE INDEX idx_services_organization_id ON services(organization_id);
CREATE INDEX idx_services_category_id ON services(category_id);

CREATE INDEX idx_work_days_employee_date ON work_days(employee_id, work_date);

CREATE INDEX idx_booking_slots_employee_start ON booking_slots(employee_id, start_at);
CREATE INDEX idx_booking_slots_status_id ON booking_slots(status_id);
CREATE INDEX idx_booking_slots_service_id ON booking_slots(service_id);

CREATE INDEX idx_bookings_citizen_id ON bookings(citizen_id);
CREATE INDEX idx_bookings_organization_id ON bookings(organization_id);
CREATE INDEX idx_bookings_employee_id ON bookings(employee_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status_id ON bookings(status_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX idx_device_push_tokens_user_id ON device_push_tokens(user_id);

-- =========================
-- SEED DATA
-- =========================

INSERT INTO roles (name) VALUES
('Citizen'),
('OrganizationEmployee'),
('PlatformAdmin');

INSERT INTO organization_statuses (code, name) VALUES
('pending', 'На модерации'),
('approved', 'Подтверждена'),
('rejected', 'Отклонена'),
('blocked', 'Заблокирована');

INSERT INTO slot_statuses (code, name) VALUES
('available', 'Доступен'),
('booked', 'Занят'),
('blocked', 'Заблокирован');

INSERT INTO booking_statuses (code, name) VALUES
('created', 'Создана'),
('confirmed', 'Подтверждена'),
('cancelled', 'Отменена'),
('rejected', 'Отклонена'),
('completed', 'Завершена');

INSERT INTO notification_types (code, name) VALUES
('booking_created', 'Запись создана'),
('booking_confirmed', 'Запись подтверждена'),
('booking_cancelled', 'Запись отменена'),
('booking_completed', 'Запись завершена');

INSERT INTO notification_channels (code, name) VALUES
('email', 'Электронная почта'),
('push', 'Push-уведомление');

INSERT INTO notification_statuses (code, name) VALUES
('created', 'Создано'),
('sent', 'Отправлено'),
('failed', 'Ошибка отправки');

-- =============================================================
-- Credentials. Password for ALL accounts: 'Test1234!'
-- PasswordHasher hash: 'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA=='
--
-- Accounts:
--   owner@civio.test      / Test1234!  — owns org1 (approved) + org2 (approved)
--   employee@civio.test   / Test1234!  — works in org1 (emp1)
--   client@civio.test     / Test1234!  — citizen with bookings (created, confirmed, cancelled)
--   admin@civio.test      / Test1234!  — PlatformAdmin
--   owner2@civio.test     / Test1234!  — owns org3 (pending moderation)
--   owner3@civio.test     / Test1234!  — owns org4 (rejected)
--   owner4@civio.test     / Test1234!  — owns org5 (blocked)
--   employee2@civio.test  / Test1234!  — no employee link (free citizen, OrganizationEmployee role)
--   employee3@civio.test  / Test1234!  — works in org2 (emp3)
--   client2@civio.test    / Test1234!  — citizen with completed + rejected bookings
--   client3@civio.test    / Test1234!  — clean citizen (no bookings)
--
-- Fixed UUIDs for predictable Postman / integration testing:
--   users        a0000000-0000-0000-0000-00000000000{1..b}
--   organizations b0000000-0000-0000-0000-00000000000{1..5}
--   employees    c0000000-0000-0000-0000-00000000000{1..4}
--   services     d0000000-0000-0000-0000-00000000000{1..4}
--   work_days    e0000000-0000-0000-0000-00000000000{1..8}
--   booking_slots f0000000-0000-0000-0000-00000000000{1..6}
--   bookings     10000000-0000-0000-0000-00000000000{1..5}
--   booking_qr   11000000-0000-0000-0000-00000000000{1..2}
--   notifications 12000000-0000-0000-0000-00000000000{1..6}
--   moderation_history 13000000-0000-0000-0000-00000000000{1..4}
--   service_categories 15000000-0000-0000-0000-00000000000{1..3}
--   device_push_tokens 16000000-0000-0000-0000-00000000000{1..3}
-- =============================================================

-- -------------------------------------------------------------
-- Users
-- -------------------------------------------------------------
INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'owner@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Иван', 'Петров', true, NOW()),

    ('a0000000-0000-0000-0000-000000000002', 'employee@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Мария', 'Иванова', true, NOW()),

    ('a0000000-0000-0000-0000-000000000003', 'client@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Алексей', 'Сидоров', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- -------------------------------------------------------------
-- User roles
-- -------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM roles WHERE name = 'Citizen'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'a0000000-0000-0000-0000-000000000002', id FROM roles WHERE name = 'OrganizationEmployee'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'a0000000-0000-0000-0000-000000000003', id FROM roles WHERE name = 'Citizen'
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Organization
-- -------------------------------------------------------------
INSERT INTO organizations (id, name, city, address, description, email, phone, status_id, owner_user_id, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Студия красоты Civio',
    'Москва',
    'ул. Тверская, 1',
    'Профессиональные услуги по уходу за внешностью',
    'info@civio.test',
    '+7 900 000-00-01',
    (SELECT id FROM organization_statuses WHERE code = 'approved'),
    'a0000000-0000-0000-0000-000000000001',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Employee
-- -------------------------------------------------------------
INSERT INTO employees (id, user_id, organization_id, first_name, last_name, position, phone, email, is_active, created_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Мария',
    'Иванова',
    'Парикмахер',
    '+7 900 000-00-02',
    'employee@civio.test',
    true,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Service
-- -------------------------------------------------------------
INSERT INTO services (id, organization_id, name, description, duration_minutes, price, is_active, created_at)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Стрижка',
    'Профессиональная стрижка',
    60,
    1500.00,
    true,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Employee ↔ Service
INSERT INTO employee_services (employee_id, service_id)
VALUES ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Work day  (2026-05-04, Monday after seed date 2026-05-02)
-- -------------------------------------------------------------
INSERT INTO work_days (id, employee_id, work_date, start_time, end_time, break_start, break_end, is_working, created_at)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '2026-05-04',
    '09:00', '18:00',
    '13:00', '14:00',
    true,
    NOW()
)
ON CONFLICT (employee_id, work_date) DO NOTHING;

-- =============================================================
-- EXTENDED SEED (E2E coverage)
-- Presentation window: now → 2026-07-01.
-- Past bookings dated 2026-05-11 (well past for any demo run).
-- Future bookings dated 2026-07-06..2026-07-10 (remain future through 2026-07-01).
-- emp1 schedule_templates: Mon–Fri 09:00–18:00 (Jul 6 = Mon).
-- =============================================================

-- -------------------------------------------------------------
-- Additional users (shared password hash)
-- -------------------------------------------------------------
DO $seed_users$
DECLARE
    pw TEXT := 'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==';
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, created_at) VALUES
        ('a0000000-0000-0000-0000-000000000004', 'admin@civio.test',     pw, 'Админ',   'Платформы',  '+7 900 000-00-04', true, NOW()),
        ('a0000000-0000-0000-0000-000000000005', 'owner2@civio.test',    pw, 'Сергей',  'Кузнецов',   '+7 900 000-00-05', true, NOW()),
        ('a0000000-0000-0000-0000-000000000006', 'owner3@civio.test',    pw, 'Андрей',  'Смирнов',    '+7 900 000-00-06', true, NOW()),
        ('a0000000-0000-0000-0000-000000000007', 'owner4@civio.test',    pw, 'Виктор',  'Морозов',    '+7 900 000-00-07', true, NOW()),
        ('a0000000-0000-0000-0000-000000000008', 'employee2@civio.test', pw, 'Ольга',   'Соколова',   '+7 900 000-00-08', true, NOW()),
        ('a0000000-0000-0000-0000-000000000009', 'employee3@civio.test', pw, 'Елена',   'Васильева',  '+7 900 000-00-09', true, NOW()),
        ('a0000000-0000-0000-0000-00000000000a', 'client2@civio.test',   pw, 'Дмитрий', 'Новиков',    '+7 900 000-00-0a', true, NOW()),
        ('a0000000-0000-0000-0000-00000000000b', 'client3@civio.test',   pw, 'Анна',    'Фёдорова',   '+7 900 000-00-0b', true, NOW())
    ON CONFLICT (email) DO NOTHING;
END
$seed_users$;

-- -------------------------------------------------------------
-- Role assignments
-- -------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT 'a0000000-0000-0000-0000-000000000004', id FROM roles WHERE name = 'PlatformAdmin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM (VALUES
    ('a0000000-0000-0000-0000-000000000005'::uuid),
    ('a0000000-0000-0000-0000-000000000006'::uuid),
    ('a0000000-0000-0000-0000-000000000007'::uuid),
    ('a0000000-0000-0000-0000-00000000000a'::uuid),
    ('a0000000-0000-0000-0000-00000000000b'::uuid)
) u(id)
CROSS JOIN roles r
WHERE r.name = 'Citizen'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM (VALUES
    ('a0000000-0000-0000-0000-000000000008'::uuid),
    ('a0000000-0000-0000-0000-000000000009'::uuid)
) u(id)
CROSS JOIN roles r
WHERE r.name = 'OrganizationEmployee'
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Additional organizations (cover all statuses)
-- -------------------------------------------------------------
INSERT INTO organizations (id, name, city, address, description, email, phone, status_id, owner_user_id, created_at) VALUES
    ('b0000000-0000-0000-0000-000000000002', 'Барбершоп Civio', 'Санкт-Петербург', 'Невский пр., 25',
        'Современный мужской барбершоп', 'spb@civio.test', '+7 900 000-00-10',
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'a0000000-0000-0000-0000-000000000001', NOW()),

    ('b0000000-0000-0000-0000-000000000003', 'Маникюрный салон Pending', 'Москва', 'ул. Арбат, 10',
        'Ожидает модерации', 'pending@civio.test', '+7 900 000-00-11',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        'a0000000-0000-0000-0000-000000000005', NOW()),

    ('b0000000-0000-0000-0000-000000000004', 'Спа-салон Rejected', 'Казань', 'ул. Кремлёвская, 5',
        'Отклонена модератором', 'rejected@civio.test', '+7 900 000-00-12',
        (SELECT id FROM organization_statuses WHERE code = 'rejected'),
        'a0000000-0000-0000-0000-000000000006', NOW()),

    ('b0000000-0000-0000-0000-000000000005', 'Студия Blocked', 'Москва', 'ул. Закрытая, 1',
        'Заблокирована', 'blocked@civio.test', '+7 900 000-00-13',
        (SELECT id FROM organization_statuses WHERE code = 'blocked'),
        'a0000000-0000-0000-0000-000000000007', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Service categories
-- -------------------------------------------------------------
INSERT INTO service_categories (id, organization_id, name, description) VALUES
    ('15000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Волосы', 'Стрижка и окрашивание'),
    ('15000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Ногти',  'Маникюр и педикюр'),
    ('15000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Стрижка', 'Мужские стрижки')
ON CONFLICT (id) DO NOTHING;

-- Attach existing service to category
UPDATE services
SET category_id = '15000000-0000-0000-0000-000000000001'
WHERE id = 'd0000000-0000-0000-0000-000000000001'
  AND category_id IS NULL;

-- -------------------------------------------------------------
-- Additional services (cover active + inactive, multi-org)
-- -------------------------------------------------------------
INSERT INTO services (id, organization_id, category_id, name, description, duration_minutes, price, is_active, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000001',
        'Окрашивание', 'Окрашивание волос', 120, 4500.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000002',
        'Маникюр (архив)', 'Снят с продажи', 90, 2000.00, false, NOW()),
    ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', '15000000-0000-0000-0000-000000000003',
        'Мужская стрижка', 'Классическая мужская стрижка', 45, 1200.00, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Additional employees
-- -------------------------------------------------------------
INSERT INTO employees (id, user_id, organization_id, first_name, last_name, position, phone, email, is_active, created_at) VALUES
    -- emp2: no user_id (admin без аккаунта в системе)
    ('c0000000-0000-0000-0000-000000000002', NULL,
        'b0000000-0000-0000-0000-000000000001',
        'Татьяна', 'Орлова', 'Администратор', '+7 900 000-00-20', NULL, true, NOW()),

    -- emp3: linked to employee3 user, works in org2
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009',
        'b0000000-0000-0000-0000-000000000002',
        'Елена', 'Васильева', 'Барбер', '+7 900 000-00-21', 'employee3@civio.test', true, NOW()),

    -- emp4: soft-deleted (is_active=false) in org1
    ('c0000000-0000-0000-0000-000000000004', NULL,
        'b0000000-0000-0000-0000-000000000001',
        'Павел', 'Зайцев', 'Стилист (уволен)', '+7 900 000-00-22', NULL, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Employee ↔ Service links
-- -------------------------------------------------------------
INSERT INTO employee_services (employee_id, service_id) VALUES
    -- emp1 also does Окрашивание
    ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
    -- emp3 does Мужская стрижка in org2
    ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Schedule templates for emp1 (Mon–Fri 09:00–18:00, break 13:00–14:00)
-- -------------------------------------------------------------
INSERT INTO schedule_templates (employee_id, day_of_week, start_time, end_time, break_start, break_end, is_active)
SELECT 'c0000000-0000-0000-0000-000000000001', d, '09:00'::time, '18:00'::time, '13:00'::time, '14:00'::time, true
FROM generate_series(1, 5) AS d
ON CONFLICT DO NOTHING;

-- Schedule template for emp3 (Tue–Sat 10:00–20:00)
INSERT INTO schedule_templates (employee_id, day_of_week, start_time, end_time, is_active)
SELECT 'c0000000-0000-0000-0000-000000000003', d, '10:00'::time, '20:00'::time, true
FROM generate_series(2, 6) AS d
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Work days for emp1 (past + today + future + day off)
-- -------------------------------------------------------------
INSERT INTO work_days (id, employee_id, work_date, start_time, end_time, break_start, break_end, is_working, created_at) VALUES
    -- Past day for COMPLETED booking
    ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '2026-05-11', '09:00', '18:00', '13:00', '14:00', true,  NOW()),
    -- Future day for CONFIRMED booking (Mon, Jul 6)
    ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '2026-07-06', '09:00', '18:00', '13:00', '14:00', true,  NOW()),
    -- Future day-off (Tue, Jul 7)
    ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2026-07-07', '09:00', '18:00', NULL,    NULL,    false, NOW()),
    -- Future day for CANCELLED + REJECTED bookings (Wed, Jul 8)
    ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', '2026-07-08', '09:00', '18:00', '13:00', '14:00', true,  NOW()),
    -- Future day for CREATED booking (Thu, Jul 9)
    ('e0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2026-07-09', '09:00', '18:00', '13:00', '14:00', true,  NOW()),
    -- Future day for admin-BLOCKED slot (Fri, Jul 10)
    ('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', '2026-07-10', '09:00', '18:00', '13:00', '14:00', true,  NOW()),
    -- emp3 work day in org2 (Tue, Jul 7 — matches emp3 Tue-Sat template)
    ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', '2026-07-07', '10:00', '20:00', NULL,    NULL,    true,  NOW())
ON CONFLICT (employee_id, work_date) DO NOTHING;

-- -------------------------------------------------------------
-- Booking slots
--   Slot statuses used: booked (for bookings), blocked (admin block)
-- -------------------------------------------------------------
INSERT INTO booking_slots (id, employee_id, service_id, work_day_id, status_id, start_at, end_at, created_at) VALUES
    -- f1: past slot for COMPLETED booking (2026-05-11)
    ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-05-11 10:00:00+00', '2026-05-11 11:00:00+00', NOW()),

    -- f2: future slot for CONFIRMED booking (2026-07-06, with QR)
    ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-07-06 10:00:00+00', '2026-07-06 11:00:00+00', NOW()),

    -- f3: slot for CANCELLED booking (2026-07-08)
    ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-07-08 11:00:00+00', '2026-07-08 12:00:00+00', NOW()),

    -- f4: slot for REJECTED booking (2026-07-08)
    ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-07-08 14:00:00+00', '2026-07-08 15:00:00+00', NOW()),

    -- f5: slot for CREATED booking — awaiting confirmation (2026-07-09)
    ('f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-07-09 15:00:00+00', '2026-07-09 16:00:00+00', NOW()),

    -- f6: admin-blocked slot, no booking (2026-07-10)
    ('f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001',
        NULL, 'e0000000-0000-0000-0000-000000000007',
        (SELECT id FROM slot_statuses WHERE code = 'blocked'),
        '2026-07-10 09:00:00+00', '2026-07-10 10:00:00+00', NOW())
ON CONFLICT (employee_id, start_at, end_at) DO NOTHING;

-- -------------------------------------------------------------
-- Bookings (one per status: created, confirmed, cancelled, rejected, completed)
-- -------------------------------------------------------------
INSERT INTO bookings (id, citizen_id, organization_id, employee_id, service_id, slot_id, status_id, comment, created_at, updated_at) VALUES
    -- b1: CREATED — client, awaits org action
    ('10000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000005',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        'Прошу подтвердить', NOW(), NULL),

    -- b2: CONFIRMED — client, future, has QR (unused)
    ('10000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000002',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        NULL, NOW(), NOW()),

    -- b3: COMPLETED — client2, past, has QR (used)
    ('10000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000001',
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        NULL, NOW(), NOW()),

    -- b4: CANCELLED — client cancelled
    ('10000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000003',
        (SELECT id FROM booking_statuses WHERE code = 'cancelled'),
        'Передумал', NOW(), NOW()),

    -- b5: REJECTED — org rejected client2
    ('10000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000004',
        (SELECT id FROM booking_statuses WHERE code = 'rejected'),
        NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Booking status history
-- -------------------------------------------------------------
INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
    -- b2: created → confirmed
    ('10000000-0000-0000-0000-000000000002',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000002', 'Подтверждено сотрудником'),

    -- b3: created → confirmed → completed
    ('10000000-0000-0000-0000-000000000003',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000002', NULL),
    ('10000000-0000-0000-0000-000000000003',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        'a0000000-0000-0000-0000-000000000002', 'QR проверен'),

    -- b4: created → cancelled
    ('10000000-0000-0000-0000-000000000004',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'cancelled'),
        'a0000000-0000-0000-0000-000000000003', 'Передумал'),

    -- b5: created → rejected
    ('10000000-0000-0000-0000-000000000005',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'rejected'),
        'a0000000-0000-0000-0000-000000000001', 'Нет мастера');

-- -------------------------------------------------------------
-- Booking QR codes
-- -------------------------------------------------------------
INSERT INTO booking_qr_codes (id, booking_id, token, expires_at, used_at, created_at) VALUES
    -- For confirmed booking — valid, unused (expires 2026-07-06 12:00 UTC)
    ('11000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'QR_TOKEN_CONFIRMED_UNUSED_FAKE_BASE64URL_AAAAAAAAAAAAAAAAAAAAAAAAAA',
        '2026-07-06 12:00:00+00', NULL, NOW()),

    -- For completed booking — already used (2026-05-11)
    ('11000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000003',
        'QR_TOKEN_COMPLETED_USED_FAKE_BASE64URL_BBBBBBBBBBBBBBBBBBBBBBBBBBB',
        '2026-05-11 12:00:00+00', '2026-05-11 10:55:00+00', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Notifications (cover types × channels × statuses)
-- -------------------------------------------------------------
INSERT INTO notifications (id, user_id, booking_id, type_id, channel_id, status_id, title, message, error_message, created_at, sent_at) VALUES
    -- created notification, email, sent
    ('12000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
        (SELECT id FROM notification_types    WHERE code = 'booking_created'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись создана', 'Ваша запись на Стрижку 2026-07-09 15:00 создана', NULL, NOW(), NOW()),

    -- confirmed, email, sent
    ('12000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002',
        (SELECT id FROM notification_types    WHERE code = 'booking_confirmed'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись подтверждена', 'Стрижка 2026-07-06 10:00 подтверждена', NULL, NOW(), NOW()),

    -- confirmed, push, created (pending dispatch)
    ('12000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002',
        (SELECT id FROM notification_types    WHERE code = 'booking_confirmed'),
        (SELECT id FROM notification_channels WHERE code = 'push'),
        (SELECT id FROM notification_statuses WHERE code = 'created'),
        'Запись подтверждена', 'Стрижка 2026-07-06 10:00', NULL, NOW(), NULL),

    -- cancelled, email, failed
    ('12000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004',
        (SELECT id FROM notification_types    WHERE code = 'booking_cancelled'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'failed'),
        'Запись отменена', 'Стрижка 2026-07-08 11:00 отменена', 'SMTP timeout', NOW(), NULL),

    -- completed, email, sent
    ('12000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000003',
        (SELECT id FROM notification_types    WHERE code = 'booking_completed'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись завершена', 'Стрижка 2026-05-11 10:00 завершена', NULL, NOW(), NOW()),

    -- completed, push, sent
    ('12000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000003',
        (SELECT id FROM notification_types    WHERE code = 'booking_completed'),
        (SELECT id FROM notification_channels WHERE code = 'push'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись завершена', 'Стрижка 2026-05-11 10:00', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Organization moderation history
-- -------------------------------------------------------------
INSERT INTO organization_moderation_history (id, organization_id, moderator_id, old_status_id, new_status_id, comment, created_at) VALUES
    -- org1: pending → approved
    ('13000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'Документы в порядке', NOW()),

    -- org2: pending → approved
    ('13000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        NULL, NOW()),

    -- org4: pending → rejected
    ('13000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'rejected'),
        'Не прошла проверку ИНН', NOW()),

    -- org5: pending → approved → blocked
    ('13000000-0000-0000-0000-000000000004',
        'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        (SELECT id FROM organization_statuses WHERE code = 'blocked'),
        'Жалобы клиентов', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Device push tokens
-- -------------------------------------------------------------
INSERT INTO device_push_tokens (id, user_id, token, platform, is_active, created_at) VALUES
    ('16000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
        'FCM_TOKEN_CLIENT_ANDROID_FAKE_TEST_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'android', true, NOW()),
    ('16000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
        'FCM_TOKEN_CLIENT_IOS_FAKE_TEST_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'ios', true, NOW()),
    ('16000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-00000000000a',
        'FCM_TOKEN_CLIENT2_ANDROID_FAKE_TEST_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'android', true, NOW())
ON CONFLICT (token) DO NOTHING;
