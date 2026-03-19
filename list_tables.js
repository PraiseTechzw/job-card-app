import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function listTables() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', res.rows.map(r => r.table_name));
    
    // Check if artisans table exists
    if (res.rows.some(r => r.table_name === 'artisans')) {
      const artRes = await client.query('SELECT * FROM artisans LIMIT 5');
      console.log('Artisans table sample:', artRes.rows);
    }
    
    // Check users for role=Artisan
    const userRes = await client.query('SELECT * FROM users WHERE role = $1', ['Artisan']);
    console.log(`Users with role Artisan: ${userRes.rows.length}`);
    
    // Check distinct roles in users
    const rolesRes = await client.query('SELECT DISTINCT role FROM users');
    console.log('Distinct roles in users:', rolesRes.rows);
  } finally {
    client.release();
    pool.end();
  }
}
listTables().catch(console.error);
