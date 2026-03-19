import ExcelJS from 'exceljs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = 'http://localhost:3001/api';

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

async function seed() {
  console.log('🚀 Starting API-based Seeding...');
  const artisans = await getArtisans();
  const machines = await getMachines();
  
  if (artisans.length === 0 || machines.length === 0) {
    console.error('❌ Excel parsing failed.');
    return;
  }

  console.log(`✅ Loaded ${artisans.length} artisans and ${machines.length} machines.`);

  for (let i = 0; i < 15; i++) {
    const machine = machines[i % machines.length];
    const artisan = artisans[i % artisans.length];
    
    const payload = {
      requestedBy: 'Production Desk',
      dateRaised: '2026-03-10',
      timeRaised: '09:00',
      priority: i % 3 === 0 ? 'Critical' : 'High',
      plantNumber: `MCH-${i}`,
      plantDescription: machine.name,
      plantStatus: 'Breakdown',
      defect: 'Abnormal noise in gearbox',
      workRequest: 'Inspect and repair primary drive',
      status: 'Draft',
      performedBy: 'System Seed'
    };

    try {
      // 1. Create Job Card (Starts at Draft)
      const res = await axios.post(`${API_URL}/job-cards`, payload);
      const card = res.data;
      console.log(`📦 Created ${card.ticketNumber} [${card.id}]`);

      // 2. Draft -> Pending
      await axios.patch(`${API_URL}/job-cards/${card.id}`, {
        status: 'Pending_Supervisor',
        performedBy: 'Initiator User',
        userRole: 'Initiator'
      });

      // 3. Pending -> Approved
      await axios.patch(`${API_URL}/job-cards/${card.id}`, {
        status: 'Approved',
        performedBy: 'HOD Approver',
        userRole: 'HOD'
      });

      // 4. Approved -> Registered
      await axios.patch(`${API_URL}/job-cards/${card.id}`, {
        status: 'Registered',
        performedBy: 'Planning Admin',
        userRole: 'PlanningOffice'
      });

      // 5. Registered -> Assigned
      await axios.patch(`${API_URL}/job-cards/${card.id}`, {
        status: 'Assigned',
        issuedTo: artisan,
        performedBy: 'Maintenance Lead',
        userRole: 'EngSupervisor'
      });

      // 6. Complete some
      if (i % 2 === 0) {
        await axios.patch(`${API_URL}/job-cards/${card.id}`, {
          status: 'InProgress',
          performedBy: artisan,
          userRole: 'Artisan'
        });

        if (i % 4 === 0) {
          await axios.patch(`${API_URL}/job-cards/${card.id}`, {
            status: 'Awaiting_SignOff',
            workDoneDetails: 'Routine maintenance and calibration.',
            dateFinished: '2026-03-12',
            machineDowntime: '2.5',
            performedBy: artisan,
            userRole: 'Artisan'
          });
          
          await axios.patch(`${API_URL}/job-cards/${card.id}`, {
            status: 'SignedOff',
            performedBy: 'Initiator User',
            userRole: 'Initiator'
          });

          await axios.patch(`${API_URL}/job-cards/${card.id}`, {
            status: 'Closed',
            performedBy: 'Supervisor',
            userRole: 'Supervisor'
          });
        }
      }

    } catch (err) {
      console.error(`❌ Failed on index ${i}:`, err.response?.data?.error || err.message);
    }
  }

  console.log('✨ API Seeding finished!');
}

seed();
