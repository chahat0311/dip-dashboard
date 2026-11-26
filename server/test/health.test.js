import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('GET /health returns ok when the database answers', async () => {
  const pool = { query: async () => ({ rows: [{ ok: 1, db_time: new Date() }] }) };
  const res = await request(createApp({ pool })).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.db, 'ok');
});

test('GET /health returns 503 when the database is down', async () => {
  const pool = { query: async () => { throw new Error('connection refused'); } };
  const res = await request(createApp({ pool })).get('/health');
  assert.equal(res.status, 503);
  assert.equal(res.body.db, 'unreachable');
});
