import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log('--- Connecting with Client ---');
  try {
    const start = Date.now();
    await client.connect();
    console.log(`Connected in ${Date.now() - start}ms`);
    
    const res = await client.query('SELECT 1 as result');
    console.log('Query result:', res.rows[0]);
    
    const tables = await client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
    console.log('Tables:', tables.rows.map(r => r.tablename));
    
  } catch (err) {
    console.error('❌ Error details:', err);
  } finally {
    await client.end();
  }
}

test();
