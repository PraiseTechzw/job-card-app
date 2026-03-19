import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function logCols() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['users']);
    console.log('User Columns:', res.rows);
  } finally {
    client.release();
    pool.end();
  }
}
logCols().catch(console.error);
