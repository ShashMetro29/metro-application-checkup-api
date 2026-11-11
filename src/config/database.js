import pg from 'pg';
import { env } from './env.js';
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});
pool.on('error', error => console.error('PostgreSQL pool error', error));
export const db = {
  query: (text, params = []) => pool.query(text, params),
  connect: () => pool.connect()
};
export async function transaction(callback) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await callback(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
