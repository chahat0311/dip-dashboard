import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSeed, GROUP_COUNT } from '../db/seed-data.js';

test('seed builds 16 groups, each with a rep, a committee member and a Fellow', () => {
  const seed = buildSeed();
  assert.equal(GROUP_COUNT, 16);
  assert.equal(seed.groups.length, 16);
  assert.equal(new Set(seed.groups.map((g) => g.code)).size, 16);
  for (const g of seed.groups) {
    assert.ok(seed.users.some((u) => u.role === 'rep' && u.group === g.code), `${g.code} has a rep`);
    const kinds = seed.assignments.filter((a) => a.group === g.code).map((a) => a.kind).sort();
    assert.deepEqual(kinds, ['committee', 'fellow']);
  }
});

test('every seeded leg arrives after it departs', () => {
  for (const it of buildSeed().itineraries) {
    for (const leg of it.legs) {
      assert.ok(new Date(leg.arrive_at) > new Date(leg.depart_at));
    }
  }
});
