import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT name, username, role FROM users WHERE name LIKE '%Praise%'");
    console.log("PRAISE USER ACCOUNT:");
    res.rows.forEach(r => console.log(`Name: '${r.name}' | Username: '${r.username}' | Role: '${r.role}'`));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
