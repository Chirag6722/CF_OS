-- ============================================================
-- CP OS v1.0 — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    image       TEXT,
    provider    TEXT NOT NULL DEFAULT 'credentials', -- google | github | credentials
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio             TEXT,
    country         TEXT,
    institute       TEXT,
    cf_handle       TEXT,          -- Codeforces handle (required on onboarding)
    lc_username     TEXT,          -- LeetCode (v2.0)
    gh_username     TEXT,          -- GitHub (v2.0)
    ac_handle       TEXT,          -- AtCoder (v2.0)
    discord_id      TEXT,
    timezone        TEXT DEFAULT 'Asia/Kolkata',
    onboarding_done BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Codeforces Cache ─────────────────────────────────────────
CREATE TABLE codeforces_data (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handle          TEXT NOT NULL,
    rating          INTEGER DEFAULT 0,
    max_rating      INTEGER DEFAULT 0,
    rank            TEXT,
    max_rank        TEXT,
    contribution    INTEGER DEFAULT 0,
    friend_count    INTEGER DEFAULT 0,
    avatar_url      TEXT,
    title_photo     TEXT,
    country         TEXT,
    city            TEXT,
    organization    TEXT,
    solved_count    INTEGER DEFAULT 0,
    -- Raw JSON caches
    rating_history  JSONB DEFAULT '[]',   -- [{contestId, rating, rank, ...}]
    submissions     JSONB DEFAULT '[]',   -- last 100 AC submissions
    contest_history JSONB DEFAULT '[]',
    problem_stats   JSONB DEFAULT '{}',   -- {byRating: {}, byTag: {}}
    last_synced_at  TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contests ────────────────────────────────────────────────
CREATE TABLE contests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform        TEXT NOT NULL,          -- codeforces | leetcode | atcoder | icpc
    contest_id      TEXT,                   -- platform-specific ID
    name            TEXT NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    duration_secs   INTEGER,
    url             TEXT,
    phase           TEXT DEFAULT 'BEFORE',  -- BEFORE | CODING | FINISHED
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, contest_id)
);

-- ─── Contest Reminders ────────────────────────────────────────
CREATE TABLE contest_reminders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    remind_before   INTEGER DEFAULT 30,    -- minutes before contest
    via_discord     BOOLEAN DEFAULT FALSE,
    via_browser     BOOLEAN DEFAULT TRUE,
    reminded_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, contest_id)
);

-- ─── Daily Tasks (Planner) ────────────────────────────────────
CREATE TABLE daily_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    tasks           JSONB NOT NULL DEFAULT '[]',
    -- tasks format: [{id, title, block, completed, type}]
    -- block: morning | afternoon | evening | night
    -- type: practice | development | upsolve | editorial | custom
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ─── Streaks ─────────────────────────────────────────────────
CREATE TABLE streaks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak  INTEGER DEFAULT 0,
    longest_streak  INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Discord Webhooks ─────────────────────────────────────────
CREATE TABLE discord_webhooks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    webhook_url     TEXT NOT NULL,
    notify_contests BOOLEAN DEFAULT TRUE,
    notify_streaks  BOOLEAN DEFAULT TRUE,
    notify_ratings  BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,  -- contest | streak | rating | system
    title           TEXT NOT NULL,
    message         TEXT,
    read            BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Settings ────────────────────────────────────────────────
CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme           TEXT DEFAULT 'dark',
    language        TEXT DEFAULT 'en',
    timezone        TEXT DEFAULT 'Asia/Kolkata',
    email_notifs    BOOLEAN DEFAULT TRUE,
    discord_notifs  BOOLEAN DEFAULT FALSE,
    browser_notifs  BOOLEAN DEFAULT TRUE,
    ai_provider     TEXT DEFAULT 'gemini',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_profiles_cf_handle ON profiles(cf_handle);
CREATE INDEX idx_contests_start_time ON contests(start_time);
CREATE INDEX idx_contests_platform ON contests(platform);
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at);

-- ─── Update Trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
