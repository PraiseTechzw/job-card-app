import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function fixDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Adding issued_to column...');
    await pool.query('ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS issued_to TEXT;');
    console.log('✅ Successfully added issued_to column.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists!');
    } else {
      console.error('❌ Failed to update schema:', err.message);
    }
  } finally {
    await pool.end();
  }
}

fixDatabase();
