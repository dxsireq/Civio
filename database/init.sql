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
-- Credentials (password hash is a placeholder — see note below):
--   owner@civio.test    / Test1234!
--   employee@civio.test / Test1234!
--   client@civio.test   / Test1234!
--
-- NOTE: password_hash uses ASP.NET Core PasswordHasher<User> (PBKDF2).
-- To get real hashes, register each user via POST /api/auth/register,
-- then copy the generated hash:
--   UPDATE users SET password_hash = '<hash>' WHERE email = 'owner@civio.test';
--
-- Fixed UUIDs for predictable Postman / integration testing:
--   owner    a0000000-0000-0000-0000-000000000001
--   employee a0000000-0000-0000-0000-000000000002
--   client   a0000000-0000-0000-0000-000000000003
--   org      b0000000-0000-0000-0000-000000000001
--   emp rec  c0000000-0000-0000-0000-000000000001
--   service  d0000000-0000-0000-0000-000000000001
--   work_day e0000000-0000-0000-0000-000000000001
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
