import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Result rows:', res.rows);
    console.log('Keys of row 0:', Object.keys(res.rows[0]));
    console.log('Value of count:', res.rows[0].count);
    
    const users = await pool.query('SELECT name, role FROM users');
    console.log('Actual users:', users.rows);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
