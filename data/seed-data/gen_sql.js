import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getArtisans() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, 'Artisan Names.xlsx'));
  const sheet = workbook.getWorksheet(1);
  const names = [];
  sheet.eachRow((row, i) => {
    const val = row.getCell(1).value || row.getCell(2).value;
    if (val && i > 1 && val.toString() !== 'Artisans' && val.toString() !== 'Artisan Name') {
       names.push(val.toString().trim());
    }
  });
  return names;
}

async function getMachines() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, 'machines with location.xlsx'));
  const sheet = workbook.getWorksheet(1);
  const machines = [];
  sheet.eachRow((row, i) => {
    if (i > 1) {
      const name = row.getCell(2).value;
      const loc = row.getCell(3).value;
      if (name && name.toString() !== 'MachineNAME') {
        machines.push({
          name: name.toString().trim(),
          location: loc ? loc.toString().trim() : 'Unknown'
        });
      }
    }
  });
  return machines;
}

async function generateSQL() {
  const artisans = await getArtisans();
  const machines = await getMachines();
  
  let sql = '-- Seed Data for Job Card System\n';
  sql += 'BEGIN;\n\n';

  for (let i = 0; i < 20; i++) {
    const id = Math.random().toString(36).substr(2, 9);
    const ticketNum = `JC-2026-${1000 + i}`;
    const machine = machines[i % machines.length];
    const artisan = artisans[i % artisans.length];
    const statusArr = ['InProgress', 'Closed', 'Awaiting_SignOff', 'Approved', 'Registered'];
    const status = statusArr[i % statusArr.length];
    
    sql += `INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('${id}', '${ticketNum}', 'Production Team', '2026-03-10', '08:00', '${i % 3 === 0 ? 'Critical' : 'High'}', 'Asset-${i}', '${machine.name.replace(/'/g, "''")}', 'Breakdown', 'Mechanical failure', '${status}');\n`;

    // Audit log
    const auditId = Math.random().toString(36).substr(2, 9);
    sql += `INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('${auditId}', '${id}', 'Initial Creation', 'System', '{"ticketNumber": "${ticketNum}"}');\n`;
    
    if (status === 'Closed' || status === 'Awaiting_SignOff') {
       const auditStatusId = Math.random().toString(36).substr(2, 9);
       sql += `INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('${auditStatusId}', '${id}', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "${status}"}');\n`;
    }
    
    // Assignment
    const assignId = Math.random().toString(36).substr(2, 9);
    sql += `INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('${assignId}', '${id}', '${artisan.replace(/'/g, "''")}', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');\n`;
  }

  sql += '\nCOMMIT;';
  
  fs.writeFileSync(path.join(__dirname, 'seed_data.sql'), sql);
  console.log('--- SQL Generator completed ---');
}

generateSQL();
