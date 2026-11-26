import express from 'express';
import cors from 'cors';

// Build the Express app. The pool is injected so tests can pass a fake one.
export function createApp({ pool }) {
  const app = express();

  const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors({ origin: origins }));
  app.use(express.json());

  // T2 walking skeleton: proves React -> Express -> Postgres end to end.
  app.get('/health', async (_req, res) => {
    const started = Date.now();
    try {
      const { rows } = await pool.query('SELECT 1 AS ok, now() AS db_time');
      res.json({
        status: 'ok',
        db: rows[0].ok === 1 ? 'ok' : 'unexpected',
        dbTime: rows[0].db_time,
        latencyMs: Date.now() - started,
      });
    } catch (err) {
      console.error('health check failed:', err.message);
      res.status(503).json({ status: 'error', db: 'unreachable', latencyMs: Date.now() - started });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Not found' } });
  });

  return app;
}
