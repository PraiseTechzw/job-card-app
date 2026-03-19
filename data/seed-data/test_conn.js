import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]);
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
    console.log('Tables found:', res.rows.map(r => r.tablename));
    
    if (res.rows.length === 0) {
      console.log('❌ No tables found in public schema!');
    } else {
      const userRes = await pool.query('SELECT * FROM users');
      console.log('Users found:', userRes.rows.length);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();
