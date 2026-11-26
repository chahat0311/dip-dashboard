// Seeds 16 test groups plus users, roster, assignments and two sample itineraries.
// Safe to run more than once: existing rows are left alone.
import 'dotenv/config';
import { createPool } from '../src/db.js';
import { buildSeed } from '../db/seed-data.js';

async function main() {
  const seed = buildSeed();
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const label of seed.themes) {
      await client.query('INSERT INTO themes (label) VALUES ($1) ON CONFLICT (label) DO NOTHING', [label]);
    }

    for (const g of seed.groups) {
      await client.query(
        `INSERT INTO groups (code, title, year, theme_id, primary_state, city)
         VALUES ($1, $2, $3, (SELECT id FROM themes WHERE label = $4), $5, $6)
         ON CONFLICT (code) DO NOTHING`,
        [g.code, g.title, g.year, g.theme, g.primary_state, g.city],
      );
    }

    for (const u of seed.users) {
      const params = [u.email, u.name, u.role, u.group];
      await client.query(
        `INSERT INTO users (email, name, role_id, group_id)
         VALUES ($1, $2, (SELECT id FROM roles WHERE code = $3), (SELECT id FROM groups WHERE code = $4))
         ON CONFLICT (email) DO NOTHING`,
        params,
      );
      await client.query(
        `INSERT INTO roster_entries (email, role_id, group_id, added_by)
         VALUES ($1, (SELECT id FROM roles WHERE code = $2), (SELECT id FROM groups WHERE code = $3),
                 (SELECT id FROM users WHERE email = 'head@dip.example.test'))
         ON CONFLICT (email) DO NOTHING`,
        [u.email, u.role, u.group],
      );
    }

    for (const a of seed.assignments) {
      await client.query(
        `INSERT INTO group_assignments (group_id, user_id, kind)
         VALUES ((SELECT id FROM groups WHERE code = $1), (SELECT id FROM users WHERE email = $2), $3)
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [a.group, a.email, a.kind],
      );
    }

    for (const it of seed.itineraries) {
      const rep = `rep.${it.group.toLowerCase()}@dip.example.test`;
      const { rows } = await client.query(
        `INSERT INTO itineraries (group_id, version, status, auto_check_status, submitted_by, approved_by, approved_at)
         VALUES ((SELECT id FROM groups WHERE code = $1), $2, $3, $4,
                 (SELECT id FROM users WHERE email = $5),
                 (SELECT id FROM users WHERE email = $6),
                 CASE WHEN $6::text IS NULL THEN NULL ELSE now() END)
         ON CONFLICT (group_id, version) DO NOTHING
         RETURNING id`,
        [it.group, it.version, it.status, it.auto_check_status, rep, it.approver],
      );
      if (rows.length === 0) continue; // already seeded
      const itineraryId = rows[0].id;
      for (const [i, leg] of it.legs.entries()) {
        await client.query(
          `INSERT INTO itinerary_legs (itinerary_id, seq, from_state, from_city, from_station,
             to_state, to_city, to_station, mode, train_no, depart_at, arrive_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [itineraryId, i + 1, ...leg.from, ...leg.to, leg.mode, leg.train_no, leg.depart_at, leg.arrive_at],
        );
      }
    }

    await client.query('COMMIT');
    const { rows: [counts] } = await client.query(
      `SELECT (SELECT count(*) FROM groups) AS groups, (SELECT count(*) FROM users) AS users,
              (SELECT count(*) FROM roster_entries) AS roster, (SELECT count(*) FROM group_assignments) AS assignments,
              (SELECT count(*) FROM itineraries) AS itineraries, (SELECT count(*) FROM itinerary_legs) AS legs`,
    );
    console.log('Seed complete:', counts);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
