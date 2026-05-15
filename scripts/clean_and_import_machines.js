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

function normalizeName(n) {
  return n
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[-_]+/g, '-')
    .toLowerCase();
}

async function collectFromExcel(filename, colNameIndex = 2, colLocIndex = 3, startRow = 3) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filename);
  } catch (err) {
    console.warn('Failed to read', filename, err.message || err);
    return [];
  }
  const sheet = workbook.getWorksheet(1);
  const items = [];
  sheet.eachRow((row, i) => {
    if (i >= startRow) {
      const name = row.values[colNameIndex];
      const loc = row.values[colLocIndex];
      if (name) items.push({ name: String(name).trim(), location: loc ? String(loc).trim() : 'Unknown' });
    }
  });
  return items;
}

async function run() {
  const sources = [
    { file: 'machines with location.xlsx', col: 2, startRow: 3, locCol: 3 },
    { file: 'Machine breakdown.xlsx', col: 4, startRow: 3 },
    { file: 'Machine breakdown query.xlsx', col: 2, startRow: 5 },
    { file: 'machineFault frequency.xlsx', col: 2, startRow: 4 },
  ];

  const collected = [];
  for (const source of sources) {
    const filePath = path.join(__dirname, '..', 'data', 'seed-data', source.file);
    const items = await collectFromExcel(filePath, source.col, source.locCol || source.col + 1, source.startRow);
    if (items && items.length) collected.push(...items);
  }

  if (collected.length === 0) {
    console.error('No valid machines found in seed files.');
    process.exit(1);
  }

  // Deduplicate by normalized name
  const map = new Map();
  for (const it of collected) {
    const key = normalizeName(it.name);
    if (!map.has(key)) map.set(key, { code: it.name, name: it.name, location: it.location, active: true });
  }

  const machines = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Write back to DB merging with any existing master_data (but we already cleared earlier)
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Fetch existing master_data to preserve other keys
    const res = await client.query("SELECT value FROM system_config WHERE key = 'master_data'");
    let master = {};
    if (res.rows.length > 0) {
      try { master = JSON.parse(res.rows[0].value); } catch (e) { master = {}; }
    }
    master['Plants / Assets'] = machines;

    await client.query(
      "INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
      ['master_data', JSON.stringify(master)]
    );
    await client.query('COMMIT');
    console.log(`Imported ${machines.length} raw machines into master_data`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB insert failed:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
