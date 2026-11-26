-- T3 / A3 Figure 4 (C1, C8): Role and Theme reference data.
CREATE TABLE roles (
  id            SMALLSERIAL PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE
                CHECK (code IN ('rep', 'committee', 'fellow', 'head', 'warden')),
  can_approve   BOOLEAN NOT NULL DEFAULT FALSE,
  can_see_all   BOOLEAN NOT NULL DEFAULT FALSE
);

-- The five roles from A3 section 1.3. Fixed data, so it lives in the migration, not the seed.
INSERT INTO roles (code, can_approve, can_see_all) VALUES
  ('rep',       FALSE, FALSE),
  ('committee', TRUE,  FALSE),
  ('fellow',    FALSE, FALSE),
  ('head',      TRUE,  TRUE),
  ('warden',    FALSE, FALSE);

CREATE TABLE themes (
  id     SERIAL PRIMARY KEY,
  label  TEXT NOT NULL UNIQUE
);
