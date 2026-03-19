import ExcelJS from 'exceljs';
import pg from 'pg';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getArtisans() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, 'Artisan Names.xlsx'));
  const sheet = workbook.getWorksheet(1);
  const names = [];
  sheet.eachRow((row, i) => {
    // console.log(`Row ${i} values:`, row.values);
    const val = row.getCell(1).value || row.getCell(2).value;
    if (val && i > 1 && val.toString() !== 'Artisans' && val.toString() !== 'Artisan Name') {
       names.push(val.toString().trim());
    }
  });
  console.log(`Found ${names.length} artisans.`);
  return names;
}

async function getMachines() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, 'machines with location.xlsx'));
  const sheet = workbook.getWorksheet(1);
  const machines = [];
  sheet.eachRow((row, i) => {
    if (i > 2) {
      const name = row.values[2];
      const loc = row.values[3];
      if (name) {
        machines.push({
          name: name.toString().trim(),
          location: loc ? loc.toString().trim() : 'Unknown'
        });
      }
    }
  });
  console.log(`Found ${machines.length} machines.`);
  return machines;
}

async function seed() {
  console.log('--- Starting Database Seeding ---');
  const artisans = await getArtisans();
  const machines = await getMachines();
  
  if (artisans.length === 0 || machines.length === 0) {
    console.error('No data found in Excel files.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing data (optional but good for clean seed)
    // await client.query('DELETE FROM job_cards');
    
    for (let i = 0; i < 10; i++) {
      const id = Math.random().toString(36).substr(2, 9);
      const ticketNum = `JC-2026-${1000 + i}`;
      const machine = machines[i % machines.length];
      const artisan = artisans[i % artisans.length];
      const statusArr = ['InProgress', 'Closed', 'Awaiting_SignOff', 'Approved', 'Registered'];
      const status = statusArr[i % statusArr.length];
      
      console.log(`Inserting ${ticketNum}...`);
      
      await client.query(
        `INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id, 
          ticketNum, 
          'Production Team', 
          '2026-03-10', 
          '08:00', 
          i % 3 === 0 ? 'Critical' : 'High', 
          `Asset-${i}`, 
          machine.name,
          'Breakdown',
          'Mechanical failure', 
          status
        ]
      );
      
      // Audit log for creation
      await client.query(
        'INSERT INTO audit_logs (id, job_card_id, action, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
        [Math.random().toString(36).substr(2, 9), id, 'Initial Creation', 'System', JSON.stringify({ ticketNumber: ticketNum })]
      );
      
      // If it's closed, add more history
      if (status === 'Closed' || status === 'Awaiting_SignOff') {
         await client.query(
          'INSERT INTO audit_logs (id, job_card_id, action, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
          [Math.random().toString(36).substr(2, 9), id, 'Status Update', 'Supervisor', JSON.stringify({ fromStatus: 'InProgress', toStatus: status })]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
