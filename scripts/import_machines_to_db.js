import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', 'machines with location.xlsx');
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(1);
  const machines = [];
  sheet.eachRow((row, i) => {
    if (i > 2) {
      const name = row.values[2];
      const loc = row.values[3];
      if (name) machines.push({ code: name.toString().trim(), name: name.toString().trim(), location: loc ? loc.toString().trim() : 'Unknown', active: true });
    }
  });

  if (machines.length === 0) {
    console.error('No machines found in Excel.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const master = { 'Plants / Assets': machines };
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
      ['master_data', JSON.stringify(master)]
    );
    await client.query('COMMIT');
    console.log(`Imported ${machines.length} machines into system_config.master_data`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB insert failed:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
