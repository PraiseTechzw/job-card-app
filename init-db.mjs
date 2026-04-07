import pkg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { STARTUP_MIGRATIONS } from './api/startupMigrations.js';

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function init() {
  try {
    console.log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Connecting to database and running schema...');
    await pool.query(schema);

    console.log('Applying startup migrations...');
    for (const statement of STARTUP_MIGRATIONS) {
      await pool.query(statement);
    }
    
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
}

init();
