import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');

async function generateMasterSQL() {
  console.log('🚀 Generating Mega SQL Setup...');
  
  let sql = '-- MASTER SETUP & SEED DATA\n';
  sql += '-- Generated from Excel Source Files\n\n';
  
  // 1. Include Schema
  try {
    const schema = fs.readFileSync(path.join(ROOT_DIR, 'schema.sql'), 'utf8');
    sql += schema + '\n\n';
  } catch (err) {
    console.error('Schema not found');
  }

  sql += 'BEGIN;\n\n';

  // 1.5. Seed Default Users
  sql += '-- Seed Default System Users\n';
  const passHash = await bcrypt.hash('admin123', 10);
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('admin-1', 'Praise Masunga', 'pmasunga', '${passHash}', 'Admin') ON CONFLICT (username) DO NOTHING;\n`;
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('super-1', 'Production Supervisor', 'production_super', '${passHash}', 'Supervisor') ON CONFLICT (username) DO NOTHING;\n`;
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('plan-1', 'Planning Officer', 'planning_office', '${passHash}', 'PlanningOffice') ON CONFLICT (username) DO NOTHING;\n`;
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('init-1', 'Maintenance Initiator', 'initiator', '${passHash}', 'Initiator') ON CONFLICT (username) DO NOTHING;\n`;
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('art-1', 'Lead Artisan', 'artisan', '${passHash}', 'Artisan') ON CONFLICT (username) DO NOTHING;\n`;
  sql += `INSERT INTO users (id, name, username, password_hash, role) VALUES ('hod-1', 'Dept. Manager', 'manager', '${passHash}', 'HOD') ON CONFLICT (username) DO NOTHING;\n`;
  sql += '\n';

  // 2. Parse Artisans & Assign SMS Numbers
  const artisanDetails = [];
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(__dirname, 'Artisan Names.xlsx'));
    const sheet = wb.getWorksheet(1);
    
    // User requested phone numbers
    const specificPhones = ['0786223289', '0774551882', '0779233526'];
    
    sheet.eachRow((row, i) => {
      const val = row.getCell(1).value || row.getCell(2).value;
      if (val && i > 1 && !['Artisans', 'Artisan Name'].includes(val.toString())) {
        const name = val.toString().trim();
        artisanDetails.push({
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          phone: specificPhones[artisanDetails.length % specificPhones.length]
        });
      }
    });
    
    // Seed Artisans Table
    sql += '-- Seed Artisans with SMS enabled numbers\n';
    artisanDetails.forEach(a => {
      sql += `INSERT INTO artisans (id, name, phone) VALUES ('${a.id}', '${a.name.replace(/'/g, "''")}', '${a.phone}') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;\n`;
    });
    sql += '\n';
  } catch (e) {
    console.error('Artisan parse failed:', e.message);
  }

  // 3. Parse Machines
  const machines = [];
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(__dirname, 'machines with location.xlsx'));
    const sheet = wb.getWorksheet(1);
    sheet.eachRow((row, i) => {
      const name = row.getCell(2).value;
      const loc = row.getCell(3).value;
      if (name && i > 1 && name.toString() !== 'MachineNAME') {
        machines.push({ name: name.toString().trim(), location: loc ? loc.toString().trim() : 'Unknown' });
      }
    });
  } catch (e) {}

  // 4. Parse Machine Breakdown Query (History)
  try {
    const wb = new ExcelJS.Workbook();
    const bdPath = path.join(__dirname, 'Machine breakdown query.xlsx');
    if (fs.existsSync(bdPath)) {
      await wb.xlsx.readFile(bdPath);
      const sheet = wb.getWorksheet(1);
      
      let count = 0;
      sheet.eachRow((row, i) => {
        try {
          if (i > 2 && count < 100) {
            const rawDate = row.getCell(2).value;
            let dateStr = '2026-03-01';
            if (rawDate instanceof Date && !isNaN(rawDate)) {
               dateStr = rawDate.toISOString().split('T')[0];
            } else if (typeof rawDate === 'string' && rawDate.includes('/')) {
               dateStr = rawDate.split('/').reverse().join('-');
            }
            
            const faultNum = row.getCell(3).value;
            const desc = row.getCell(4).value;
            const workDone = row.getCell(5).value;
            const timeTaken = row.getCell(6).value;
            const rawArtisan = row.getCell(7).value;
            
            if (desc || workDone) {
              const id = Math.random().toString(36).substr(2, 9);
              const jcNumber = `JC-HIST-${faultNum || 1010 + i}`;
              const safeDesc = (desc || 'Maintenance Job').toString().replace(/'/g, "''");
              const safeWork = (workDone || 'Work done as per schedule').toString().replace(/'/g, "''");
              
              const matchingArtisan = artisanDetails.find(a => a.name === rawArtisan?.toString().trim());
              const artisanName = matchingArtisan ? matchingArtisan.name : (artisanDetails[i % artisanDetails.length]?.name || 'System');
              const artisanPhone = matchingArtisan ? matchingArtisan.phone : (artisanDetails[i % artisanDetails.length]?.phone || '');
              
              sql += `INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('${id}', '${jcNumber}', 'Historical Import', '${dateStr}', '08:00', 'Medium', '${(safeDesc.substring(0, 50))}', '${safeDesc}', '${safeWork}', 'Closed', '${artisanName}', '${dateStr}', '${timeTaken || '1.0'}') ON CONFLICT (ticket_number) DO NOTHING;\n`;
              
              // Assignment link with Phone
              const assignId = Math.random().toString(36).substr(2, 9);
              sql += `INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('${assignId}', '${id}', '${artisanName.replace(/'/g, "''")}', '${artisanPhone}', 'System', '${dateStr}', 'Completed');\n`;

              count++;
            }
          }
        } catch (inner) {}
      });
    }
  } catch (e) {
     console.error('Breakdown parse failed:', e.message);
  }

  // 5. Add current pending data for testing
  for (let i = 0; i < 5; i++) {
     const id = Math.random().toString(36).substr(2, 9);
     const ticket = `JC-LIVE-${5000 + i}`;
     const m = machines[i % machines.length] || { name: 'Lathe-01', location: 'Section A' };
     const a = artisanDetails[i % artisanDetails.length];
     
     sql += `INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('${id}', '${ticket}', 'Supervisor J.', '2026-03-18', '10:00', 'High', '${m.name.replace(/'/g, "''")}', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;\n`;
  }

  sql += '\nCOMMIT;';
  
  fs.writeFileSync(path.join(__dirname, 'setup_everything.sql'), sql);
  console.log('✨ Mega SQL Setup with SMS Support generated successfully!');
}

generateMasterSQL();
