import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT id, name, status FROM artisans WHERE name IN ('Lead Artisan', 'Praise Masunga')");
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
