import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT id, ticket_number, status, issued_to FROM job_cards ORDER BY created_at DESC LIMIT 5");
    console.log("TOP 5 NEW JOB CARDS:");
    res.rows.forEach(r => console.log(`${r.ticket_number} | Status: ${r.status} | IssuedTo: ${r.issued_to}`));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
