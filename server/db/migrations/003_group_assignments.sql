-- T3 / A3 Figure 4 (C1): GroupAssignment decides which groups a committee member or Fellow sees (A3 D5).
CREATE TABLE group_assignments (
  id          SERIAL PRIMARY KEY,
  group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('committee', 'fellow')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX group_assignments_user_id_idx ON group_assignments(user_id);
