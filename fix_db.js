import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function fix() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Patching missing sign-offs for existing advanced jobs...');
    
    await pool.query("UPDATE job_cards SET approved_by_supervisor = 'System Auto-Recovery' WHERE status IN ('Approved', 'Registered', 'Assigned', 'InProgress', 'Awaiting_SignOff', 'SignedOff', 'Closed') AND approved_by_supervisor IS NULL");
    
    await pool.query("UPDATE job_cards SET approved_by_hod = 'System Auto-Recovery' WHERE status IN ('Registered', 'Assigned', 'InProgress', 'Awaiting_SignOff', 'SignedOff', 'Closed') AND priority IN ('High', 'Critical') AND approved_by_hod IS NULL");
    
    await pool.query("UPDATE job_cards SET registration_planning = 'System Auto-Recovery' WHERE status IN ('Registered', 'Assigned', 'InProgress', 'Awaiting_SignOff', 'SignedOff', 'Closed') AND registration_planning IS NULL");
    
    console.log('✅ Backfilled sign-offs perfectly!');
  } finally {
    pool.end();
  }
}

fix().catch(console.error);
