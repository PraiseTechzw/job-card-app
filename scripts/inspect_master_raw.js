import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT value, updated_at FROM system_config WHERE key = 'master_data'");
    if (res.rows.length === 0) {
      console.log('No master_data row found');
      return;
    }
    const raw = res.rows[0].value;
    console.log('type of value:', typeof raw);
    console.log('updated_at:', res.rows[0].updated_at);
    try {
      console.log('----- RAW JSON -----');
      console.log(JSON.stringify(raw, null, 2).slice(0, 4000));
      console.log('----- END -----');
    } catch (e) {
      console.log('Could not stringify raw value:', e.message || e);
    }
  } catch (err) {
    console.error('Error reading master_data:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
