import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log('🔄 Fetching users with role Artisan...');
    const usersRes = await pool.query("SELECT id, name, phone, department, status FROM users WHERE role = 'Artisan'");
    
    console.log('📋 Fetching existing legacy artisans...');
    const artisansRes = await pool.query("SELECT name FROM artisans");
    const existingNames = new Set(artisansRes.rows.map(r => r.name));

    let syncedCount = 0;
    for (const u of usersRes.rows) {
      if (!existingNames.has(u.name)) {
        console.log(`⏳ Syncing user into artisans: ${u.name}`);
        try {
          await pool.query(
            'INSERT INTO artisans (name, phone, trade, status) VALUES ($1, $2, $3, $4)',
            [u.name, u.phone || '', u.department || 'General', u.status || 'Active']
          );
          syncedCount++;
        } catch (err) {
           console.log(`First query failed: ${err.message}. Trying fallback ID injection...`);
           try {
             await pool.query(
              'INSERT INTO artisans (id, name, phone, trade, status) VALUES ($1, $2, $3, $4, $5)',
              [u.id, u.name, u.phone || '', u.department || 'General', u.status || 'Active']
             );
             syncedCount++;
           } catch (fallbackErr) {
             console.log(`Fallback also failed for ${u.name}: ${fallbackErr.message}`);
           }
        }
      }
    }
    console.log(`✅ Completely synced ${syncedCount} missing artisans from the users table into the main job assignment list.`);
  } catch (err) {
    console.error('Migration crashed:', err.message);
  } finally {
    pool.end();
  }
}

run();
