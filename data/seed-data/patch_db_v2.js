import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function fixDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Adding missing columns to job_cards...');
    const queries = [
      'ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS approved_by_supervisor TEXT;',
      'ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS approved_by_hod TEXT;',
      'ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS registration_planning TEXT;',
      'ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS originator_sign_off TEXT;',
      'ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS closed_by TEXT;'
    ];
    for (const q of queries) {
      await pool.query(q);
      console.log('Executed:', q);
    }
    console.log('✅ Successfully added missing columns.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Columns already exist!');
    } else {
      console.error('❌ Failed to update schema:', err.message);
    }
  } finally {
    await pool.end();
  }
}

fixDatabase();
