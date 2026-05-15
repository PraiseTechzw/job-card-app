import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT value FROM system_config WHERE key = 'master_data'");
    if (res.rows.length === 0) {
      console.log('No master_data found');
      return;
    }
    let master = res.rows[0].value;
    if (typeof master === 'string') {
      try { master = JSON.parse(master); } catch (e) { master = {}; }
    }
    const machines = (master && master['Plants / Assets']) || [];
    console.log(`Found ${machines.length} machines in master_data['Plants / Assets']`);
    console.log(JSON.stringify(machines, null, 2));
  } catch (err) {
    console.error('Error reading master_data:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
