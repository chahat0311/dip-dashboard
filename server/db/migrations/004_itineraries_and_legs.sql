-- T3 / A3 Figure 4 (C2): Itinerary and ItineraryLeg.
-- A new version supersedes the old one; a version is never edited in place (A3 4.1 model rules).
CREATE TABLE itineraries (
  id                 SERIAL PRIMARY KEY,
  group_id           INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  version            INTEGER NOT NULL CHECK (version >= 1),
  status             TEXT NOT NULL DEFAULT 'Pending review'
                     CHECK (status IN ('Pending review', 'Changes requested', 'Approved', 'Superseded')),
  auto_check_status  TEXT NOT NULL DEFAULT 'Running'
                     CHECK (auto_check_status IN ('Running', 'Passed', 'Failed')),
  submitted_by       INTEGER NOT NULL REFERENCES users(id),
  approved_by        INTEGER REFERENCES users(id),
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at        TIMESTAMPTZ,
  UNIQUE (group_id, version),
  CHECK ((status = 'Approved') = (approved_by IS NOT NULL))
);

-- At most one live (non-superseded) version per group.
CREATE UNIQUE INDEX itineraries_one_live_per_group
  ON itineraries(group_id) WHERE status <> 'Superseded';

CREATE TABLE itinerary_legs (
  id             SERIAL PRIMARY KEY,
  itinerary_id   INTEGER NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  seq            SMALLINT NOT NULL CHECK (seq >= 1),
  from_state     TEXT NOT NULL,
  from_city      TEXT NOT NULL,
  from_station   TEXT,
  to_state       TEXT NOT NULL,
  to_city        TEXT NOT NULL,
  to_station     TEXT,
  mode           TEXT NOT NULL CHECK (mode IN ('train', 'bus', 'flight', 'road', 'other')),
  train_no       TEXT,
  depart_at      TIMESTAMPTZ NOT NULL,
  arrive_at      TIMESTAMPTZ NOT NULL,
  UNIQUE (itinerary_id, seq),
  CHECK (arrive_at > depart_at),
  CHECK (mode <> 'train' OR train_no IS NOT NULL)
);

CREATE INDEX itinerary_legs_itinerary_id_idx ON itinerary_legs(itinerary_id);
