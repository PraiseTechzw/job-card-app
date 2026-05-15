import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Fetch current master_data
    const res = await client.query("SELECT value FROM system_config WHERE key = 'master_data'");
    let master = {};
    if (res.rows.length > 0) {
      try { master = JSON.parse(res.rows[0].value); } catch (e) { master = {}; }
    }

    // Remove Plants / Assets key
    if (master && Object.prototype.hasOwnProperty.call(master, 'Plants / Assets')) {
      delete master['Plants / Assets'];
      await client.query(
        "INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
        ['master_data', JSON.stringify(master)]
      );
      console.log('Cleared Plants / Assets from master_data');
    } else {
      console.log('No Plants / Assets key found in master_data');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to clear machines:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
