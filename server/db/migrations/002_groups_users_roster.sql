-- T3 / A3 Figure 4 (C1): Group, User, RosterEntry.
CREATE TABLE groups (
  id             SERIAL PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,          -- e.g. G01
  title          TEXT NOT NULL,
  year           SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  theme_id       INTEGER REFERENCES themes(id) ON DELETE SET NULL,
  primary_state  TEXT,
  city           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  name           TEXT NOT NULL,
  role_id        SMALLINT NOT NULL REFERENCES roles(id),
  group_id       INTEGER REFERENCES groups(id) ON DELETE SET NULL,  -- only for reps
  google_sub     TEXT UNIQUE,                    -- filled on first Google sign-in
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roster allow-list (A3 D3): only emails here may sign in, with the role given here.
CREATE TABLE roster_entries (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  role_id     SMALLINT NOT NULL REFERENCES roles(id),
  group_id    INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  added_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_group_id_idx ON users(group_id);
CREATE INDEX roster_entries_group_id_idx ON roster_entries(group_id);
