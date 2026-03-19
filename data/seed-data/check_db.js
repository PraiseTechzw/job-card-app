import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
    console.log('Tables in database:', res.rows.map(r => r.tablename));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
checkDb();
