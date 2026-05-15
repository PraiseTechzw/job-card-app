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
    console.log('raw value length:', res.rows[0].value.length);
    console.log('updated_at:', res.rows[0].updated_at);
    console.log('----- RAW START -----');
    console.log(res.rows[0].value.slice(0, 2000));
    console.log('----- RAW END -----');
  } catch (err) {
    console.error('Error reading master_data:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
