import pg from 'pg';

// One shared pool for the whole process (A3: one PostgreSQL database for app and worker).
export function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy server/.env.example to server/.env.');
  }
  const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;
  return new pg.Pool({ connectionString, ssl, max: 5 });
}
