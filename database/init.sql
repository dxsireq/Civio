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
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

CREATE TABLE email_verification_codes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash   TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    attempts    INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_evc_user ON email_verification_codes(user_id);

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

CREATE TABLE employee_invitations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    token           TEXT NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    invited_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    accepted_at     TIMESTAMPTZ
);
CREATE INDEX idx_employee_invitations_token ON employee_invitations(token);
CREATE INDEX idx_employee_invitations_employee_id ON employee_invitations(employee_id);

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
--   client4@civio.test    / Test1234!  — citizen, org1 confirmed + completed manicure
--   client5@civio.test    / Test1234!  — citizen, org1 created pedicure
--   client6@civio.test    / Test1234!  — citizen, org1 confirmed facial
--   (employee2@civio.test now also linked to org1 as emp5 — мастер маникюра)
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
INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, is_email_verified, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'owner@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Иван', 'Петров', true, true, NOW()),

    ('a0000000-0000-0000-0000-000000000002', 'employee@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Мария', 'Иванова', true, true, NOW()),

    ('a0000000-0000-0000-0000-000000000003', 'client@civio.test',
     'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
     'Алексей', 'Сидоров', true, true, NOW())
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
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified, created_at) VALUES
        ('a0000000-0000-0000-0000-000000000004', 'admin@civio.test',     pw, 'Админ',   'Платформы',  '+7 900 000-00-04', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000005', 'owner2@civio.test',    pw, 'Сергей',  'Кузнецов',   '+7 900 000-00-05', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000006', 'owner3@civio.test',    pw, 'Андрей',  'Смирнов',    '+7 900 000-00-06', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000007', 'owner4@civio.test',    pw, 'Виктор',  'Морозов',    '+7 900 000-00-07', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000008', 'employee2@civio.test', pw, 'Ольга',   'Соколова',   '+7 900 000-00-08', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000009', 'employee3@civio.test', pw, 'Елена',   'Васильева',  '+7 900 000-00-09', true, true, NOW()),
        ('a0000000-0000-0000-0000-00000000000a', 'client2@civio.test',   pw, 'Дмитрий', 'Новиков',    '+7 900 000-00-0a', true, true, NOW()),
        ('a0000000-0000-0000-0000-00000000000b', 'client3@civio.test',   pw, 'Анна',    'Фёдорова',   '+7 900 000-00-0b', true, true, NOW())
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
        'Татьяна', 'Орлова', 'Администратор', '+7 900 000-00-20', 't.orlova@civio.test', true, NOW()),

    -- emp3: linked to employee3 user, works in org2
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009',
        'b0000000-0000-0000-0000-000000000002',
        'Елена', 'Васильева', 'Барбер', '+7 900 000-00-21', 'employee3@civio.test', true, NOW()),

    -- emp4: стилист org1
    ('c0000000-0000-0000-0000-000000000004', NULL,
        'b0000000-0000-0000-0000-000000000001',
        'Павел', 'Зайцев', 'Стилист', '+7 900 000-00-22', 'p.zaytsev@civio.test', true, NOW())
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

-- =============================================================
-- EXTENDED SEED 2 — org1 deep data ("Студия красоты Civio")
-- Fills org1 with more staff, services and bookings.
-- Presentation window: now (2026-06-10) → 2026-07-01.
--   Past booking dated 2026-05-18 (Mon). Future bookings 2026-06-15..24.
-- New fixed UUIDs:
--   users        a0000000-...-00000000000{c..e}
--   employees    c0000000-...-00000000000{5,6}
--   services     d0000000-...-00000000000{5..8}
--   categories   15000000-...-000000000004
--   work_days    e0000000-...-00000000000{9..e}
--   booking_slots f0000000-...-00000000000{7..d}
--   bookings     10000000-...-00000000000{6..a}
--   booking_qr   11000000-...-00000000000{3..5}
--   notifications 12000000-...-00000000000{7..b}
--   device_push  16000000-...-00000000000{4,5}
-- New accounts (password Test1234!):
--   client4@civio.test / client5@civio.test / client6@civio.test — citizens
--   employee2@civio.test — now linked to org1 (emp5, мастер маникюра)
-- =============================================================

-- -------------------------------------------------------------
-- Additional citizens
-- -------------------------------------------------------------
DO $seed_users2$
DECLARE
    pw TEXT := 'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==';
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified, created_at) VALUES
        ('a0000000-0000-0000-0000-00000000000c', 'client4@civio.test', pw, 'Игорь', 'Лебедев',   '+7 900 000-00-0c', true, true, NOW()),
        ('a0000000-0000-0000-0000-00000000000d', 'client5@civio.test', pw, 'Ольга', 'Захарова',  '+7 900 000-00-0d', true, true, NOW()),
        ('a0000000-0000-0000-0000-00000000000e', 'client6@civio.test', pw, 'Роман', 'Григорьев', '+7 900 000-00-0e', true, true, NOW())
    ON CONFLICT (email) DO NOTHING;
END
$seed_users2$;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM (VALUES
    ('a0000000-0000-0000-0000-00000000000c'::uuid),
    ('a0000000-0000-0000-0000-00000000000d'::uuid),
    ('a0000000-0000-0000-0000-00000000000e'::uuid)
) u(id)
CROSS JOIN roles r
WHERE r.name = 'Citizen'
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Additional service category for org1
-- -------------------------------------------------------------
INSERT INTO service_categories (id, organization_id, name, description) VALUES
    ('15000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Косметология', 'Уход за лицом')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Additional services for org1
-- -------------------------------------------------------------
INSERT INTO services (id, organization_id, category_id, name, description, duration_minutes, price, is_active, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000002',
        'Маникюр классический', 'Классический маникюр с покрытием', 60, 2200.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000002',
        'Педикюр', 'Аппаратный педикюр', 90, 2800.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000004',
        'Чистка лица', 'Комбинированная чистка лица', 75, 3500.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000001',
        'Укладка', 'Праздничная укладка', 45, 1800.00, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Additional employees for org1
--   emp5: linked to employee2@civio.test (мастер маникюра)
--   emp6: no user account (косметолог)
-- -------------------------------------------------------------
INSERT INTO employees (id, user_id, organization_id, first_name, last_name, position, phone, email, is_active, created_at) VALUES
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000008',
        'b0000000-0000-0000-0000-000000000001',
        'Ольга', 'Соколова', 'Мастер маникюра', '+7 900 000-00-08', 'employee2@civio.test', true, NOW()),

    ('c0000000-0000-0000-0000-000000000006', NULL,
        'b0000000-0000-0000-0000-000000000001',
        'Ирина', 'Беляева', 'Косметолог', '+7 900 000-00-23', 'i.belyaeva@civio.test', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Employee ↔ Service links
-- -------------------------------------------------------------
INSERT INTO employee_services (employee_id, service_id) VALUES
    -- emp5: manicure + pedicure
    ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005'),
    ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006'),
    -- emp6: facial cleaning
    ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000007'),
    -- emp1 also does укладка
    ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Schedule templates
--   emp5: Mon–Sat 10:00–19:00, break 14:00–15:00
--   emp6: Wed–Sun 11:00–20:00
-- -------------------------------------------------------------
INSERT INTO schedule_templates (employee_id, day_of_week, start_time, end_time, break_start, break_end, is_active)
SELECT 'c0000000-0000-0000-0000-000000000005', d, '10:00'::time, '19:00'::time, '14:00'::time, '15:00'::time, true
FROM generate_series(1, 6) AS d
ON CONFLICT DO NOTHING;

INSERT INTO schedule_templates (employee_id, day_of_week, start_time, end_time, is_active)
SELECT 'c0000000-0000-0000-0000-000000000006', d, '11:00'::time, '20:00'::time, true
FROM generate_series(3, 7) AS d
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Work days
-- -------------------------------------------------------------
INSERT INTO work_days (id, employee_id, work_date, start_time, end_time, break_start, break_end, is_working, created_at) VALUES
    -- emp5 past day (Mon, May 18) for COMPLETED booking
    ('e0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', '2026-05-18', '10:00', '19:00', '14:00', '15:00', true, NOW()),
    -- emp5 future days (Mon, Jun 15 / Mon, Jun 22)
    ('e0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000005', '2026-06-15', '10:00', '19:00', '14:00', '15:00', true, NOW()),
    ('e0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-000000000005', '2026-06-22', '10:00', '19:00', '14:00', '15:00', true, NOW()),
    -- emp6 future days (Wed, Jun 17 / Wed, Jun 24)
    ('e0000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000006', '2026-06-17', '11:00', '20:00', NULL, NULL, true, NOW()),
    ('e0000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000006', '2026-06-24', '11:00', '20:00', NULL, NULL, true, NOW()),
    -- emp1 extra day (Tue, Jun 16) for укладка booking
    ('e0000000-0000-0000-0000-00000000000e', 'c0000000-0000-0000-0000-000000000001', '2026-06-16', '09:00', '18:00', '13:00', '14:00', true, NOW())
ON CONFLICT (employee_id, work_date) DO NOTHING;

-- -------------------------------------------------------------
-- Booking slots
-- -------------------------------------------------------------
INSERT INTO booking_slots (id, employee_id, service_id, work_day_id, status_id, start_at, end_at, created_at) VALUES
    -- f7: emp5 past slot — COMPLETED manicure (2026-05-18)
    ('f0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000009',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-05-18 11:00:00+00', '2026-05-18 12:00:00+00', NOW()),

    -- f8: emp5 future slot — CONFIRMED manicure (2026-06-15, with QR)
    ('f0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-00000000000a',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-15 10:00:00+00', '2026-06-15 11:00:00+00', NOW()),

    -- f9: emp5 future slot — CREATED pedicure (2026-06-22)
    ('f0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-00000000000b',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-22 12:00:00+00', '2026-06-22 13:30:00+00', NOW()),

    -- fa: emp6 future slot — CONFIRMED facial (2026-06-17, with QR)
    ('f0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000006',
        'd0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-00000000000c',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-17 11:00:00+00', '2026-06-17 12:15:00+00', NOW()),

    -- fb: emp1 future slot — CONFIRMED укладка (2026-06-16)
    ('f0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-00000000000e',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-16 09:00:00+00', '2026-06-16 09:45:00+00', NOW()),

    -- fc: emp5 free slot (available, no booking) — 2026-06-15
    ('f0000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-00000000000a',
        (SELECT id FROM slot_statuses WHERE code = 'available'),
        '2026-06-15 15:00:00+00', '2026-06-15 16:00:00+00', NOW()),

    -- fd: emp6 admin-blocked slot, no booking — 2026-06-24
    ('f0000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000006',
        NULL, 'e0000000-0000-0000-0000-00000000000d',
        (SELECT id FROM slot_statuses WHERE code = 'blocked'),
        '2026-06-24 11:00:00+00', '2026-06-24 12:00:00+00', NOW())
ON CONFLICT (employee_id, start_at, end_at) DO NOTHING;

-- -------------------------------------------------------------
-- Bookings
-- -------------------------------------------------------------
INSERT INTO bookings (id, citizen_id, organization_id, employee_id, service_id, slot_id, status_id, comment, created_at, updated_at) VALUES
    -- b6: CONFIRMED — client4, manicure with emp5 (has QR)
    ('10000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-00000000000c', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005',
        'f0000000-0000-0000-0000-000000000008',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        NULL, NOW(), NOW()),

    -- b7: CREATED — client5, pedicure with emp5
    ('10000000-0000-0000-0000-000000000007',
        'a0000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006',
        'f0000000-0000-0000-0000-000000000009',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        'Можно чуть пораньше?', NOW(), NULL),

    -- b8: CONFIRMED — client6, facial with emp6 (has QR)
    ('10000000-0000-0000-0000-000000000008',
        'a0000000-0000-0000-0000-00000000000e', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000007',
        'f0000000-0000-0000-0000-00000000000a',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        NULL, NOW(), NOW()),

    -- b9: COMPLETED — client4, past manicure with emp5 (QR used)
    ('10000000-0000-0000-0000-000000000009',
        'a0000000-0000-0000-0000-00000000000c', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005',
        'f0000000-0000-0000-0000-000000000007',
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        NULL, NOW(), NOW()),

    -- b10: CONFIRMED — client (a..03), укладка with emp1
    ('10000000-0000-0000-0000-00000000000a',
        'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008',
        'f0000000-0000-0000-0000-00000000000b',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'К событию вечером', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Booking status history
-- -------------------------------------------------------------
INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
    -- b6: created → confirmed
    ('10000000-0000-0000-0000-000000000006',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000008', 'Подтверждено мастером'),

    -- b8: created → confirmed
    ('10000000-0000-0000-0000-000000000008',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000001', NULL),

    -- b9: created → confirmed → completed
    ('10000000-0000-0000-0000-000000000009',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000008', NULL),
    ('10000000-0000-0000-0000-000000000009',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        'a0000000-0000-0000-0000-000000000008', 'QR проверен'),

    -- b10: created → confirmed
    ('10000000-0000-0000-0000-00000000000a',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000002', 'Подтверждено сотрудником');

-- -------------------------------------------------------------
-- Booking QR codes
-- -------------------------------------------------------------
INSERT INTO booking_qr_codes (id, booking_id, token, expires_at, used_at, created_at) VALUES
    -- b6 confirmed — valid, unused (expires 2026-06-15 12:00 UTC)
    ('11000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000006',
        'QR_TOKEN_ORG1_MANICURE_CONFIRMED_FAKE_BASE64URL_DDDDDDDDDDDDDDDDDDD',
        '2026-06-15 12:00:00+00', NULL, NOW()),

    -- b8 confirmed — valid, unused (expires 2026-06-17 14:00 UTC)
    ('11000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000008',
        'QR_TOKEN_ORG1_FACIAL_CONFIRMED_FAKE_BASE64URL_EEEEEEEEEEEEEEEEEEEEE',
        '2026-06-17 14:00:00+00', NULL, NOW()),

    -- b9 completed — already used (2026-05-18)
    ('11000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000009',
        'QR_TOKEN_ORG1_MANICURE_COMPLETED_FAKE_BASE64URL_FFFFFFFFFFFFFFFFFFF',
        '2026-05-18 12:00:00+00', '2026-05-18 11:50:00+00', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Notifications
-- -------------------------------------------------------------
INSERT INTO notifications (id, user_id, booking_id, type_id, channel_id, status_id, title, message, error_message, created_at, sent_at) VALUES
    -- b6 created, email, sent
    ('12000000-0000-0000-0000-000000000007',
        'a0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000006',
        (SELECT id FROM notification_types    WHERE code = 'booking_created'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись создана', 'Маникюр классический 2026-06-15 10:00 создана', NULL, NOW(), NOW()),

    -- b6 confirmed, push, sent
    ('12000000-0000-0000-0000-000000000008',
        'a0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000006',
        (SELECT id FROM notification_types    WHERE code = 'booking_confirmed'),
        (SELECT id FROM notification_channels WHERE code = 'push'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись подтверждена', 'Маникюр классический 2026-06-15 10:00', NULL, NOW(), NOW()),

    -- b7 created, email, sent
    ('12000000-0000-0000-0000-000000000009',
        'a0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000007',
        (SELECT id FROM notification_types    WHERE code = 'booking_created'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись создана', 'Педикюр 2026-06-22 12:00 создана', NULL, NOW(), NOW()),

    -- b8 confirmed, email, sent
    ('12000000-0000-0000-0000-00000000000a',
        'a0000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000008',
        (SELECT id FROM notification_types    WHERE code = 'booking_confirmed'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись подтверждена', 'Чистка лица 2026-06-17 11:00 подтверждена', NULL, NOW(), NOW()),

    -- b9 completed, email, sent
    ('12000000-0000-0000-0000-00000000000b',
        'a0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000009',
        (SELECT id FROM notification_types    WHERE code = 'booking_completed'),
        (SELECT id FROM notification_channels WHERE code = 'email'),
        (SELECT id FROM notification_statuses WHERE code = 'sent'),
        'Запись завершена', 'Маникюр классический 2026-05-18 11:00 завершена', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Device push tokens
-- -------------------------------------------------------------
INSERT INTO device_push_tokens (id, user_id, token, platform, is_active, created_at) VALUES
    ('16000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000c',
        'FCM_TOKEN_CLIENT4_ANDROID_FAKE_TEST_DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', 'android', true, NOW()),
    ('16000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-00000000000e',
        'FCM_TOKEN_CLIENT6_IOS_FAKE_TEST_EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', 'ios', true, NOW())
ON CONFLICT (token) DO NOTHING;

-- =============================================================
-- EXTENDED SEED 3 — full org-status coverage + per-org staff
-- Final org distribution:
--   pending  (3): org3, org6, org7
--   approved (5): org1, org2, org8, org9, org10
--   rejected (1): org4   blocked (1): org5   — итого 2 «отменённых»
-- Every org gets ≥2 employees and ≥2 services with employee↔service links.
-- New bookings: org2 — one per each booking status (5), org8 — confirmed + completed (2).
-- Presentation window: now (2026-06-11) → 2026-07-01.
--   Past bookings: 2026-05-19 (Tue), 2026-05-20 (Wed).
--   Future bookings: 2026-06-16 (Tue), 2026-06-23 (Tue), 2026-06-25 (Thu).
-- New fixed UUIDs:
--   users        a0000000-...-00000000000f, a0000000-...-0000000000{10..13}
--   organizations b0000000-...-00000000000{6..a}
--   employees    c0000000-...-00000000000{7..f}, c0000000-...-0000000000{10..18}
--   services     d0000000-...-00000000000{9..f}, d0000000-...-0000000000{10..1a}
--   work_days    e0000000-...-00000000000f, e0000000-...-0000000000{10..13}
--   booking_slots f0000000-...-00000000000{e..f}, f0000000-...-0000000000{10..14}
--   bookings     10000000-...-00000000000{b..f}, 10000000-...-000000000010, -000000000011
--   booking_qr   11000000-...-00000000000{6..8}
--   moderation_history 13000000-...-00000000000{5..7}
-- New accounts (password Test1234!):
--   owner5@civio.test — owns org6 (pending)
--   owner6@civio.test — owns org7 (pending)
--   owner7@civio.test — owns org8 (approved)
--   owner8@civio.test — owns org9 (approved)
--   owner9@civio.test — owns org10 (approved)
-- =============================================================

-- -------------------------------------------------------------
-- New organization owners
-- -------------------------------------------------------------
DO $seed_users3$
DECLARE
    pw TEXT := 'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==';
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified, created_at) VALUES
        ('a0000000-0000-0000-0000-00000000000f', 'owner5@civio.test', pw, 'Николай',   'Орлов',      '+7 900 000-00-0f', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000010', 'owner6@civio.test', pw, 'Павел',     'Гордеев',    '+7 900 000-00-30', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000011', 'owner7@civio.test', pw, 'Екатерина', 'Романова',   '+7 900 000-00-31', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000012', 'owner8@civio.test', pw, 'Олег',      'Виноградов', '+7 900 000-00-32', true, true, NOW()),
        ('a0000000-0000-0000-0000-000000000013', 'owner9@civio.test', pw, 'Татьяна',   'Белова',     '+7 900 000-00-33', true, true, NOW())
    ON CONFLICT (email) DO NOTHING;
END
$seed_users3$;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM (VALUES
    ('a0000000-0000-0000-0000-00000000000f'::uuid),
    ('a0000000-0000-0000-0000-000000000010'::uuid),
    ('a0000000-0000-0000-0000-000000000011'::uuid),
    ('a0000000-0000-0000-0000-000000000012'::uuid),
    ('a0000000-0000-0000-0000-000000000013'::uuid)
) u(id)
CROSS JOIN roles r
WHERE r.name = 'Citizen'
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- New organizations (org6, org7 — pending; org8..org10 — approved)
-- -------------------------------------------------------------
INSERT INTO organizations (id, name, city, address, description, email, phone, status_id, owner_user_id, created_at) VALUES
    ('b0000000-0000-0000-0000-000000000006', 'Тату-студия InkArt', 'Москва', 'ул. Покровка, 17',
        'Художественная татуировка, ожидает модерации', 'inkart@civio.test', '+7 900 000-00-40',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        'a0000000-0000-0000-0000-00000000000f', NOW()),

    ('b0000000-0000-0000-0000-000000000007', 'Фотостудия Кадр', 'Екатеринбург', 'ул. Ленина, 52',
        'Студийная фотосъёмка, ожидает модерации', 'kadr@civio.test', '+7 900 000-00-41',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        'a0000000-0000-0000-0000-000000000010', NOW()),

    ('b0000000-0000-0000-0000-000000000008', 'Фитнес-студия Тонус', 'Москва', 'Ленинский пр., 38',
        'Персональные тренировки и массаж', 'tonus@civio.test', '+7 900 000-00-42',
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'a0000000-0000-0000-0000-000000000011', NOW()),

    ('b0000000-0000-0000-0000-000000000009', 'Автосервис Мотор', 'Новосибирск', 'ул. Большевистская, 101',
        'Обслуживание и ремонт автомобилей', 'motor@civio.test', '+7 900 000-00-43',
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'a0000000-0000-0000-0000-000000000012', NOW()),

    ('b0000000-0000-0000-0000-00000000000a', 'Стоматология Дента', 'Санкт-Петербург', 'Московский пр., 73',
        'Терапевтическая стоматология и гигиена', 'denta@civio.test', '+7 900 000-00-44',
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'a0000000-0000-0000-0000-000000000013', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Moderation history for new approved orgs (pending → approved)
-- -------------------------------------------------------------
INSERT INTO organization_moderation_history (id, organization_id, moderator_id, old_status_id, new_status_id, comment, created_at) VALUES
    ('13000000-0000-0000-0000-000000000005',
        'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'Документы в порядке', NOW()),
    ('13000000-0000-0000-0000-000000000006',
        'b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        NULL, NOW()),
    ('13000000-0000-0000-0000-000000000007',
        'b0000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000004',
        (SELECT id FROM organization_statuses WHERE code = 'pending'),
        (SELECT id FROM organization_statuses WHERE code = 'approved'),
        'Лицензия проверена', NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Services (every org gets ≥2)
-- -------------------------------------------------------------
INSERT INTO services (id, organization_id, name, description, duration_minutes, price, is_active, created_at) VALUES
    -- org2 (Барбершоп) — second service
    ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002',
        'Моделирование бороды', 'Стрижка и оформление бороды', 30, 800.00, true, NOW()),

    -- org3 (Маникюрный салон, pending)
    ('d0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-000000000003',
        'Маникюр', 'Классический маникюр', 60, 1800.00, true, NOW()),
    ('d0000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-000000000003',
        'Наращивание ногтей', 'Наращивание гелем', 120, 3500.00, true, NOW()),

    -- org4 (Спа-салон, rejected)
    ('d0000000-0000-0000-0000-00000000000c', 'b0000000-0000-0000-0000-000000000004',
        'Релакс-массаж', 'Расслабляющий массаж всего тела', 60, 2500.00, true, NOW()),
    ('d0000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000004',
        'Обёртывание', 'Водорослевое обёртывание', 90, 3200.00, true, NOW()),

    -- org5 (Студия, blocked)
    ('d0000000-0000-0000-0000-00000000000e', 'b0000000-0000-0000-0000-000000000005',
        'Стрижка', 'Базовая стрижка', 60, 1000.00, true, NOW()),
    ('d0000000-0000-0000-0000-00000000000f', 'b0000000-0000-0000-0000-000000000005',
        'Укладка', 'Повседневная укладка', 45, 900.00, true, NOW()),

    -- org6 (Тату-студия, pending)
    ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
        'Татуировка малая', 'Татуировка до 10 см', 120, 6000.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000006',
        'Разработка эскиза', 'Индивидуальный эскиз', 60, 2000.00, true, NOW()),

    -- org7 (Фотостудия, pending)
    ('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000007',
        'Студийная фотосессия', 'Час съёмки в студии', 60, 4000.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000007',
        'Аренда зала', 'Аренда фотозала без фотографа', 60, 1500.00, true, NOW()),

    -- org8 (Фитнес-студия, approved)
    ('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000008',
        'Персональная тренировка', 'Тренировка с инструктором', 60, 2500.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000008',
        'Спортивный массаж', 'Восстановительный массаж', 60, 3000.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000008',
        'Стретчинг', 'Индивидуальная растяжка', 45, 1500.00, true, NOW()),

    -- org9 (Автосервис, approved)
    ('d0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000009',
        'Замена масла', 'Замена масла и фильтра', 30, 1500.00, true, NOW()),
    ('d0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000009',
        'Диагностика ходовой', 'Полная диагностика подвески', 60, 2000.00, true, NOW()),

    -- org10 (Стоматология, approved)
    ('d0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-00000000000a',
        'Консультация стоматолога', 'Первичный осмотр и план лечения', 30, 1000.00, true, NOW()),
    ('d0000000-0000-0000-0000-00000000001a', 'b0000000-0000-0000-0000-00000000000a',
        'Профессиональная чистка зубов', 'Ультразвук + Air Flow', 60, 4500.00, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Employees (every org gets ≥2; new employees without user accounts)
-- -------------------------------------------------------------
INSERT INTO employees (id, user_id, organization_id, first_name, last_name, position, phone, email, is_active, created_at) VALUES
    -- org2 — second barber
    ('c0000000-0000-0000-0000-000000000007', NULL, 'b0000000-0000-0000-0000-000000000002',
        'Тимур', 'Назаров', 'Барбер', '+7 900 000-00-50', 't.nazarov@civio.test', true, NOW()),

    -- org3 (pending)
    ('c0000000-0000-0000-0000-000000000008', NULL, 'b0000000-0000-0000-0000-000000000003',
        'Светлана', 'Крылова', 'Мастер маникюра', '+7 900 000-00-51', 's.krylova@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000009', NULL, 'b0000000-0000-0000-0000-000000000003',
        'Вера', 'Тихонова', 'Мастер маникюра', '+7 900 000-00-52', 'v.tikhonova@civio.test', true, NOW()),

    -- org4 (rejected)
    ('c0000000-0000-0000-0000-00000000000a', NULL, 'b0000000-0000-0000-0000-000000000004',
        'Пётр', 'Сафонов', 'Массажист', '+7 900 000-00-53', 'p.safonov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-00000000000b', NULL, 'b0000000-0000-0000-0000-000000000004',
        'Дарья', 'Мельникова', 'Косметолог', '+7 900 000-00-54', 'd.melnikova@civio.test', true, NOW()),

    -- org5 (blocked)
    ('c0000000-0000-0000-0000-00000000000c', NULL, 'b0000000-0000-0000-0000-000000000005',
        'Кирилл', 'Богданов', 'Парикмахер', '+7 900 000-00-55', 'k.bogdanov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-00000000000d', NULL, 'b0000000-0000-0000-0000-000000000005',
        'Лидия', 'Власова', 'Парикмахер', '+7 900 000-00-56', 'l.vlasova@civio.test', true, NOW()),

    -- org6 (pending)
    ('c0000000-0000-0000-0000-00000000000e', NULL, 'b0000000-0000-0000-0000-000000000006',
        'Глеб', 'Жуков', 'Тату-мастер', '+7 900 000-00-57', 'g.zhukov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-00000000000f', NULL, 'b0000000-0000-0000-0000-000000000006',
        'Нина', 'Полякова', 'Тату-мастер', '+7 900 000-00-58', 'n.polyakova@civio.test', true, NOW()),

    -- org7 (pending)
    ('c0000000-0000-0000-0000-000000000010', NULL, 'b0000000-0000-0000-0000-000000000007',
        'Марк', 'Соловьёв', 'Фотограф', '+7 900 000-00-59', 'm.solovyov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000011', NULL, 'b0000000-0000-0000-0000-000000000007',
        'Алиса', 'Ковалёва', 'Фотограф', '+7 900 000-00-5a', 'a.kovaleva@civio.test', true, NOW()),

    -- org8 (approved)
    ('c0000000-0000-0000-0000-000000000012', NULL, 'b0000000-0000-0000-0000-000000000008',
        'Максим', 'Волков', 'Тренер', '+7 900 000-00-5b', 'm.volkov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000013', NULL, 'b0000000-0000-0000-0000-000000000008',
        'Наталья', 'Киселёва', 'Массажист', '+7 900 000-00-5c', 'n.kiseleva@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000014', NULL, 'b0000000-0000-0000-0000-000000000008',
        'Артём', 'Гусев', 'Тренер', '+7 900 000-00-5d', 'a.gusev@civio.test', true, NOW()),

    -- org9 (approved)
    ('c0000000-0000-0000-0000-000000000015', NULL, 'b0000000-0000-0000-0000-000000000009',
        'Олег', 'Титов', 'Механик', '+7 900 000-00-5e', 'o.titov@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000016', NULL, 'b0000000-0000-0000-0000-000000000009',
        'Денис', 'Ершов', 'Механик', '+7 900 000-00-5f', 'd.ershov@civio.test', true, NOW()),

    -- org10 (approved)
    ('c0000000-0000-0000-0000-000000000017', NULL, 'b0000000-0000-0000-0000-00000000000a',
        'Алина', 'Маркова', 'Стоматолог', '+7 900 000-00-60', 'a.markova@civio.test', true, NOW()),
    ('c0000000-0000-0000-0000-000000000018', NULL, 'b0000000-0000-0000-0000-00000000000a',
        'Юлия', 'Климова', 'Гигиенист', '+7 900 000-00-61', 'y.klimova@civio.test', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Employee ↔ Service links
-- -------------------------------------------------------------
INSERT INTO employee_services (employee_id, service_id) VALUES
    -- org2: emp3 + emp7 do both services
    ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000009'),
    ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000004'),
    ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009'),
    -- org3
    ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-00000000000a'),
    ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-00000000000b'),
    ('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-00000000000a'),
    -- org4
    ('c0000000-0000-0000-0000-00000000000a', 'd0000000-0000-0000-0000-00000000000c'),
    ('c0000000-0000-0000-0000-00000000000b', 'd0000000-0000-0000-0000-00000000000d'),
    -- org5
    ('c0000000-0000-0000-0000-00000000000c', 'd0000000-0000-0000-0000-00000000000e'),
    ('c0000000-0000-0000-0000-00000000000d', 'd0000000-0000-0000-0000-00000000000e'),
    ('c0000000-0000-0000-0000-00000000000d', 'd0000000-0000-0000-0000-00000000000f'),
    -- org6
    ('c0000000-0000-0000-0000-00000000000e', 'd0000000-0000-0000-0000-000000000010'),
    ('c0000000-0000-0000-0000-00000000000e', 'd0000000-0000-0000-0000-000000000011'),
    ('c0000000-0000-0000-0000-00000000000f', 'd0000000-0000-0000-0000-000000000010'),
    -- org7
    ('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000012'),
    ('c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000012'),
    ('c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000013'),
    -- org8
    ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000014'),
    ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000016'),
    ('c0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000015'),
    ('c0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014'),
    -- org9
    ('c0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000017'),
    ('c0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000018'),
    ('c0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000017'),
    -- org10
    ('c0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000019'),
    ('c0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-00000000001a')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Work days
--   emp3 (org2): Tue–Sat template → 2026-05-19 (Tue, past), 2026-06-16 (Tue), 2026-06-23 (Tue)
--   org8: c..12 тренер 2026-06-25 (Thu), c..13 массажист 2026-05-20 (Wed, past)
-- -------------------------------------------------------------
INSERT INTO work_days (id, employee_id, work_date, start_time, end_time, break_start, break_end, is_working, created_at) VALUES
    ('e0000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000003', '2026-05-19', '10:00', '20:00', NULL, NULL, true, NOW()),
    ('e0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', '2026-06-16', '10:00', '20:00', NULL, NULL, true, NOW()),
    ('e0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', '2026-06-23', '10:00', '20:00', NULL, NULL, true, NOW()),
    ('e0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000012', '2026-06-25', '09:00', '18:00', '13:00', '14:00', true, NOW()),
    ('e0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000013', '2026-05-20', '09:00', '18:00', '13:00', '14:00', true, NOW())
ON CONFLICT (employee_id, work_date) DO NOTHING;

-- -------------------------------------------------------------
-- Booking slots
-- -------------------------------------------------------------
INSERT INTO booking_slots (id, employee_id, service_id, work_day_id, status_id, start_at, end_at, created_at) VALUES
    -- fe: emp3 past slot — COMPLETED стрижка (2026-05-19)
    ('f0000000-0000-0000-0000-00000000000e', 'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000000f',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-05-19 11:00:00+00', '2026-05-19 11:45:00+00', NOW()),

    -- ff: emp3 future slot — CONFIRMED стрижка (2026-06-16)
    ('f0000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000010',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-16 11:00:00+00', '2026-06-16 11:45:00+00', NOW()),

    -- f10: emp3 future slot — CREATED борода (2026-06-16)
    ('f0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000010',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-16 13:00:00+00', '2026-06-16 13:30:00+00', NOW()),

    -- f11: emp3 future slot — CANCELLED стрижка (2026-06-23)
    ('f0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000011',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-23 11:00:00+00', '2026-06-23 11:45:00+00', NOW()),

    -- f12: emp3 future slot — REJECTED борода (2026-06-23)
    ('f0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000011',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-23 14:00:00+00', '2026-06-23 14:30:00+00', NOW()),

    -- f13: org8 тренер future slot — CONFIRMED тренировка (2026-06-25)
    ('f0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000012',
        'd0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000012',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-06-25 12:00:00+00', '2026-06-25 13:00:00+00', NOW()),

    -- f14: org8 массажист past slot — COMPLETED массаж (2026-05-20)
    ('f0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000013',
        'd0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000013',
        (SELECT id FROM slot_statuses WHERE code = 'booked'),
        '2026-05-20 10:00:00+00', '2026-05-20 11:00:00+00', NOW())
ON CONFLICT (employee_id, start_at, end_at) DO NOTHING;

-- -------------------------------------------------------------
-- Bookings (org2 — one per status, org8 — confirmed + completed)
-- -------------------------------------------------------------
INSERT INTO bookings (id, citizen_id, organization_id, employee_id, service_id, slot_id, status_id, comment, created_at, updated_at) VALUES
    -- b11: COMPLETED — client2, past стрижка in org2
    ('10000000-0000-0000-0000-00000000000b',
        'a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004',
        'f0000000-0000-0000-0000-00000000000e',
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        NULL, NOW(), NOW()),

    -- b12: CONFIRMED — client4, стрижка in org2 (has QR)
    ('10000000-0000-0000-0000-00000000000c',
        'a0000000-0000-0000-0000-00000000000c', 'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004',
        'f0000000-0000-0000-0000-00000000000f',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        NULL, NOW(), NOW()),

    -- b13: CREATED — client5, борода in org2
    ('10000000-0000-0000-0000-00000000000d',
        'a0000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000009',
        'f0000000-0000-0000-0000-000000000010',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        'Первый раз у вас', NOW(), NULL),

    -- b14: CANCELLED — client, стрижка in org2
    ('10000000-0000-0000-0000-00000000000e',
        'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004',
        'f0000000-0000-0000-0000-000000000011',
        (SELECT id FROM booking_statuses WHERE code = 'cancelled'),
        'Не смогу прийти', NOW(), NOW()),

    -- b15: REJECTED — client6, борода in org2
    ('10000000-0000-0000-0000-00000000000f',
        'a0000000-0000-0000-0000-00000000000e', 'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000009',
        'f0000000-0000-0000-0000-000000000012',
        (SELECT id FROM booking_statuses WHERE code = 'rejected'),
        NULL, NOW(), NOW()),

    -- b16: CONFIRMED — client5, тренировка in org8
    ('10000000-0000-0000-0000-000000000010',
        'a0000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000008',
        'c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000014',
        'f0000000-0000-0000-0000-000000000013',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        NULL, NOW(), NOW()),

    -- b17: COMPLETED — client6, past массаж in org8
    ('10000000-0000-0000-0000-000000000011',
        'a0000000-0000-0000-0000-00000000000e', 'b0000000-0000-0000-0000-000000000008',
        'c0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000015',
        'f0000000-0000-0000-0000-000000000014',
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Booking status history
-- -------------------------------------------------------------
INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
    -- b11: created → confirmed → completed
    ('10000000-0000-0000-0000-00000000000b',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000009', NULL),
    ('10000000-0000-0000-0000-00000000000b',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        'a0000000-0000-0000-0000-000000000009', 'QR проверен'),

    -- b12: created → confirmed
    ('10000000-0000-0000-0000-00000000000c',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000009', 'Подтверждено барбером'),

    -- b14: created → cancelled (by citizen)
    ('10000000-0000-0000-0000-00000000000e',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'cancelled'),
        'a0000000-0000-0000-0000-000000000003', 'Не смогу прийти'),

    -- b15: created → rejected (by org)
    ('10000000-0000-0000-0000-00000000000f',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'rejected'),
        'a0000000-0000-0000-0000-000000000009', 'Мастер в отпуске'),

    -- b16: created → confirmed (by org8 owner)
    ('10000000-0000-0000-0000-000000000010',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000011', NULL),

    -- b17: created → confirmed → completed (by org8 owner)
    ('10000000-0000-0000-0000-000000000011',
        (SELECT id FROM booking_statuses WHERE code = 'created'),
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        'a0000000-0000-0000-0000-000000000011', NULL),
    ('10000000-0000-0000-0000-000000000011',
        (SELECT id FROM booking_statuses WHERE code = 'confirmed'),
        (SELECT id FROM booking_statuses WHERE code = 'completed'),
        'a0000000-0000-0000-0000-000000000011', 'QR проверен');

-- -------------------------------------------------------------
-- Booking QR codes
-- -------------------------------------------------------------
INSERT INTO booking_qr_codes (id, booking_id, token, expires_at, used_at, created_at) VALUES
    -- b12 confirmed — valid, unused (expires 2026-06-16 13:00 UTC)
    ('11000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-00000000000c',
        'QR_TOKEN_ORG2_HAIRCUT_CONFIRMED_FAKE_BASE64URL_GGGGGGGGGGGGGGGGGGGG',
        '2026-06-16 13:00:00+00', NULL, NOW()),

    -- b11 completed — already used (2026-05-19)
    ('11000000-0000-0000-0000-000000000007',
        '10000000-0000-0000-0000-00000000000b',
        'QR_TOKEN_ORG2_HAIRCUT_COMPLETED_FAKE_BASE64URL_HHHHHHHHHHHHHHHHHHHH',
        '2026-05-19 12:00:00+00', '2026-05-19 10:55:00+00', NOW()),

    -- b16 confirmed — valid, unused (expires 2026-06-25 14:00 UTC)
    ('11000000-0000-0000-0000-000000000008',
        '10000000-0000-0000-0000-000000000010',
        'QR_TOKEN_ORG8_TRAINING_CONFIRMED_FAKE_BASE64URL_IIIIIIIIIIIIIIIIIII',
        '2026-06-25 14:00:00+00', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- EXTENDED SEED 4 — loginable staff + ≥10 bookings for EVERY org
-- Goal:
--   * Every organization gets ≥2 employees with CONFIRMED accounts
--     (employees.user_id set + accepted employee_invitations row +
--      Citizen/OrganizationEmployee roles) — they can log in.
--   * Login = employee email (e.g. s.krylova@civio.test) / Test1234!
--   * org1 keeps UNCONFIRMED staff (Татьяна Орлова, Павел Зайцев,
--     Ирина Беляева) as PENDING invitations — "Ожидает принятия".
--   * Every organization gets ≥10 bookings tied to its confirmed staff,
--     mixing all statuses (created/confirmed/completed/cancelled/rejected).
--
-- Generation is set-based + procedural with deterministic UUID prefixes
-- (re-run safe via ON CONFLICT / NOT EXISTS):
--   users (promoted)     23000000-...
--   employee_invitations 24000000-...
--   bookings             20000000-...
--   work_days            21000000-...
--   booking_slots        22000000-...
--   booking_qr_codes     25000000-...
-- Booking dates: 2026-04-13 (past → completed), 2026-06-26 / 06-29 /
--   07-02 / 07-03 (future).
-- =============================================================

-- -------------------------------------------------------------
-- Part A — give every employee without an account a loginable user
--   (excludes org1's 3 staff that stay PENDING: t.orlova / p.zaytsev /
--    i.belyaeva). Login email = employee email.
-- -------------------------------------------------------------
WITH to_promote AS (
    SELECT e.id, e.email, e.first_name, e.last_name, e.phone,
           row_number() OVER (ORDER BY e.created_at, e.id) AS rn
    FROM employees e
    WHERE e.user_id IS NULL
      AND e.email IS NOT NULL
      AND e.email NOT IN ('t.orlova@civio.test', 'p.zaytsev@civio.test', 'i.belyaeva@civio.test')
)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified, created_at)
SELECT ('23000000-0000-0000-0000-' || lpad(to_hex(rn), 12, '0'))::uuid,
       email,
       'AQAAAAIAAYagAAAAEDt1Xws6yspZSSkQsSzNAmRgGDoELZZVrTpIpt9M+0B9L+phIHPuG2viLxgzC+GEgA==',
       first_name, last_name, phone, true, true, NOW()
FROM to_promote
ON CONFLICT (email) DO NOTHING;

-- Link employees to their freshly created users (by shared email)
UPDATE employees e
SET user_id = u.id, is_active = true
FROM users u
WHERE e.user_id IS NULL
  AND e.email = u.email;

-- Roles for every confirmed employee (Citizen + OrganizationEmployee)
INSERT INTO user_roles (user_id, role_id)
SELECT DISTINCT e.user_id, r.id
FROM employees e
CROSS JOIN roles r
WHERE e.user_id IS NOT NULL
  AND r.name IN ('Citizen', 'OrganizationEmployee')
ON CONFLICT DO NOTHING;

-- Accepted invitations for every confirmed employee lacking one
INSERT INTO employee_invitations (id, employee_id, organization_id, email, token, status, invited_by, created_at, expires_at, accepted_at)
SELECT ('24000000-0000-0000-0000-' || lpad(to_hex(row_number() OVER (ORDER BY e.id)), 12, '0'))::uuid,
       e.id, e.organization_id, COALESCE(e.email, ''),
       'ACCEPTED_TOKEN_' || replace(e.id::text, '-', ''),
       'accepted', o.owner_user_id,
       NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '9 days'
FROM employees e
JOIN organizations o ON o.id = e.organization_id
WHERE e.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM employee_invitations i WHERE i.employee_id = e.id)
ON CONFLICT DO NOTHING;

-- Pending invitations for org1's unconfirmed staff ("Ожидает принятия")
INSERT INTO employee_invitations (id, employee_id, organization_id, email, token, status, invited_by, created_at, expires_at, accepted_at)
SELECT ('24000000-0000-0000-0000-' || lpad(to_hex(4000 + row_number() OVER (ORDER BY e.id)), 12, '0'))::uuid,
       e.id, e.organization_id, e.email,
       'PENDING_TOKEN_' || replace(e.id::text, '-', ''),
       'pending', o.owner_user_id,
       NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NULL
FROM employees e
JOIN organizations o ON o.id = e.organization_id
WHERE e.user_id IS NULL
  AND e.email IN ('t.orlova@civio.test', 'p.zaytsev@civio.test', 'i.belyaeva@civio.test')
  AND NOT EXISTS (SELECT 1 FROM employee_invitations i WHERE i.employee_id = e.id)
ON CONFLICT DO NOTHING;

-- Schedule templates (Mon–Fri 09:00–18:00) for confirmed employees lacking one
INSERT INTO schedule_templates (employee_id, day_of_week, start_time, end_time, is_active)
SELECT e.id, d, '09:00'::time, '18:00'::time, true
FROM employees e
CROSS JOIN generate_series(1, 5) AS d
WHERE e.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM schedule_templates st WHERE st.employee_id = e.id)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Part B/C — ≥10 bookings per org across all confirmed employees
--   5 bookings per confirmed employee, one per fixed date, mixed status.
-- -------------------------------------------------------------
DO $seed4_bookings$
DECLARE
    citizens uuid[] := ARRAY[
        'a0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-00000000000a',
        'a0000000-0000-0000-0000-00000000000b',
        'a0000000-0000-0000-0000-00000000000c',
        'a0000000-0000-0000-0000-00000000000d',
        'a0000000-0000-0000-0000-00000000000e'
    ]::uuid[];
    dates    date[] := ARRAY['2026-04-13', '2026-06-26', '2026-06-29', '2026-07-02', '2026-07-03']::date[];
    hours    int[]  := ARRAY[10, 11, 12, 14, 15];
    statuses text[] := ARRAY['completed', 'confirmed', 'created', 'confirmed', 'cancelled'];
    rec       record;
    cnt       int := 0;
    i         int;
    v_date    date;
    v_start   timestamptz;
    v_end     timestamptz;
    v_status  text;
    v_citizen uuid;
    v_wd uuid; v_slot uuid; v_book uuid; v_qr uuid; v_status_id uuid;
    s_booked    uuid;
    bs_created  uuid; bs_confirmed uuid; bs_completed uuid; bs_cancelled uuid; bs_rejected uuid;
BEGIN
    SELECT id INTO s_booked     FROM slot_statuses    WHERE code = 'booked';
    SELECT id INTO bs_created   FROM booking_statuses WHERE code = 'created';
    SELECT id INTO bs_confirmed FROM booking_statuses WHERE code = 'confirmed';
    SELECT id INTO bs_completed FROM booking_statuses WHERE code = 'completed';
    SELECT id INTO bs_cancelled FROM booking_statuses WHERE code = 'cancelled';
    SELECT id INTO bs_rejected  FROM booking_statuses WHERE code = 'rejected';

    FOR rec IN
        SELECT e.id AS employee_id, e.organization_id, o.owner_user_id,
               (SELECT es.service_id FROM employee_services es WHERE es.employee_id = e.id LIMIT 1) AS service_id,
               row_number() OVER (PARTITION BY e.organization_id ORDER BY e.created_at, e.id) AS emp_rank
        FROM employees e
        JOIN organizations o ON o.id = e.organization_id
        WHERE e.user_id IS NOT NULL AND e.is_active
          AND EXISTS (SELECT 1 FROM employee_services es WHERE es.employee_id = e.id)
    LOOP
        FOR i IN 1..5 LOOP
            cnt := cnt + 1;
            v_date  := dates[i];
            v_start := (v_date::text || ' ' || lpad(hours[i]::text, 2, '0') || ':00:00+00')::timestamptz;
            v_end   := v_start + INTERVAL '1 hour';
            v_status := statuses[i];
            -- second master in each org closes with a REJECTED booking for full coverage
            IF rec.emp_rank = 2 AND i = 5 THEN
                v_status := 'rejected';
            END IF;
            v_citizen := citizens[1 + (cnt % 6)];

            v_wd   := ('21000000-0000-0000-0000-' || lpad(to_hex(cnt), 12, '0'))::uuid;
            v_slot := ('22000000-0000-0000-0000-' || lpad(to_hex(cnt), 12, '0'))::uuid;
            v_book := ('20000000-0000-0000-0000-' || lpad(to_hex(cnt), 12, '0'))::uuid;
            v_qr   := ('25000000-0000-0000-0000-' || lpad(to_hex(cnt), 12, '0'))::uuid;

            v_status_id := CASE v_status
                WHEN 'created'   THEN bs_created
                WHEN 'confirmed' THEN bs_confirmed
                WHEN 'completed' THEN bs_completed
                WHEN 'cancelled' THEN bs_cancelled
                WHEN 'rejected'  THEN bs_rejected
            END;

            INSERT INTO work_days (id, employee_id, work_date, start_time, end_time, is_working, created_at)
            VALUES (v_wd, rec.employee_id, v_date, '09:00', '19:00', true, NOW())
            ON CONFLICT (employee_id, work_date) DO NOTHING;

            INSERT INTO booking_slots (id, employee_id, service_id, work_day_id, status_id, start_at, end_at, created_at)
            VALUES (v_slot, rec.employee_id, rec.service_id, v_wd, s_booked, v_start, v_end, NOW())
            ON CONFLICT (employee_id, start_at, end_at) DO NOTHING;

            INSERT INTO bookings (id, citizen_id, organization_id, employee_id, service_id, slot_id, status_id, comment, created_at, updated_at)
            VALUES (v_book, v_citizen, rec.organization_id, rec.employee_id, rec.service_id, v_slot, v_status_id,
                    CASE WHEN v_status = 'created' THEN 'Прошу подтвердить' ELSE NULL END,
                    NOW(), CASE WHEN v_status = 'created' THEN NULL ELSE NOW() END)
            ON CONFLICT (id) DO NOTHING;

            IF v_status = 'completed' THEN
                INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
                    (v_book, bs_created,   bs_confirmed, rec.owner_user_id, NULL),
                    (v_book, bs_confirmed, bs_completed, rec.owner_user_id, 'QR проверен');
                INSERT INTO booking_qr_codes (id, booking_id, token, expires_at, used_at, created_at)
                VALUES (v_qr, v_book, 'QR_SEED4_' || lpad(to_hex(cnt), 12, '0') || '_USED', v_end, v_start + INTERVAL '50 minutes', NOW())
                ON CONFLICT (id) DO NOTHING;
            ELSIF v_status = 'confirmed' THEN
                INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
                    (v_book, bs_created, bs_confirmed, rec.owner_user_id, NULL);
                INSERT INTO booking_qr_codes (id, booking_id, token, expires_at, used_at, created_at)
                VALUES (v_qr, v_book, 'QR_SEED4_' || lpad(to_hex(cnt), 12, '0') || '_UNUSED', v_end, NULL, NOW())
                ON CONFLICT (id) DO NOTHING;
            ELSIF v_status = 'cancelled' THEN
                INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
                    (v_book, bs_created, bs_cancelled, v_citizen, 'Отмена клиентом');
            ELSIF v_status = 'rejected' THEN
                INSERT INTO booking_status_history (booking_id, old_status_id, new_status_id, changed_by_id, comment) VALUES
                    (v_book, bs_created, bs_rejected, rec.owner_user_id, 'Отклонено организацией');
            END IF;
        END LOOP;
    END LOOP;
END
$seed4_bookings$;
