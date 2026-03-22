import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const artisansRes = await pool.query("SELECT id, name FROM artisans");
    console.log("ARTISANS:", artisansRes.rows);
    const usersRes = await pool.query("SELECT id, name FROM users WHERE role = 'Artisan'");
    console.log("USERS:", usersRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
