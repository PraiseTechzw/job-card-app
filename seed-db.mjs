import pkg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SEED_DATA = {
  jobCards: [
    {
      id: uuidv4(),
      ticket_number: 'JC-2026-0001',
      requested_by: 'John Initiator',
      date_raised: '2026-03-10',
      time_raised: '08:30',
      priority: 'High',
      required_completion_date: '2026-03-12',
      plant_number: 'P-101',
      plant_description: 'Main Conveyor Belt 1',
      plant_status: 'Shut',
      defect: 'Belt slippage and unusual noise from motor.',
      maintenance_schedule: 'Monthly Inspection due.',
      work_request: 'Check motor alignment and replace belt if necessary.',
      allocated_trades: JSON.stringify(['Fitting', 'Electrical']),
      status: 'Pending_Supervisor',
      created_at: new Date('2026-03-10T08:30:00Z'),
      updated_at: new Date('2026-03-10T08:30:00Z')
    },
    {
      id: uuidv4(),
      ticket_number: 'JC-2026-0002',
      requested_by: 'Alice Requester',
      date_raised: '2026-03-11',
      time_raised: '10:15',
      priority: 'Critical',
      required_completion_date: '2026-03-11',
      plant_number: 'P-205',
      plant_description: 'Hydraulic Press #4',
      plant_status: 'Shut',
      defect: 'Severe oil leak from main cylinder.',
      maintenance_schedule: 'None',
      work_request: 'Immediate seal replacement and fluid top-up.',
      allocated_trades: JSON.stringify(['Fitting']),
      status: 'InProgress',
      issued_to: 'Bob Technician',
      created_at: new Date('2026-03-11T10:15:00Z'),
      updated_at: new Date('2026-03-11T14:20:00Z')
    },
    {
      id: uuidv4(),
      ticket_number: 'JC-2026-0003',
      requested_by: 'Jane Smith',
      date_raised: '2026-03-09',
      time_raised: '14:00',
      priority: 'Medium',
      required_completion_date: '2026-03-15',
      plant_number: 'P-302',
      plant_description: 'Cooling Tower Fan',
      plant_status: 'Run',
      defect: 'One blade showing signs of vibration.',
      maintenance_schedule: 'Quarterly',
      work_request: 'Balance fan blades and check bearings.',
      allocated_trades: JSON.stringify(['Fitting']),
      status: 'Closed',
      closed_by_date: '2026-03-11',
      closed_by_time: '16:00',
      closure_comment: 'Blades balanced and bearings greased. Fan running smoothly.',
      created_at: new Date('2026-03-09T14:00:00Z'),
      updated_at: new Date('2026-03-11T16:00:00Z')
    }
  ],
  allocationSheets: [
    {
      id: uuidv4(),
      supervisor: 'Dave Supervisor',
      section: 'Fitting',
      date: '2026-03-12',
      created_at: new Date()
    }
  ]
};

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional, but good for clean seed)
    // await pool.query('DELETE FROM allocation_rows');
    // await pool.query('DELETE FROM allocation_sheets');
    // await pool.query('DELETE FROM audit_logs');
    // await pool.query('DELETE FROM assignments');
    // await pool.query('DELETE FROM job_cards');

    // Seed Job Cards
    for (const jc of SEED_DATA.jobCards) {
      await pool.query(
        `INSERT INTO job_cards (
          id, ticket_number, requested_by, date_raised, time_raised, priority, 
          required_completion_date, plant_number, plant_description, plant_status, 
          defect, maintenance_schedule, work_request, allocated_trades, status, 
          created_at, updated_at, issued_to, closed_by_date, closed_by_time, closure_comment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          jc.id, jc.ticket_number, jc.requested_by, jc.date_raised, jc.time_raised, jc.priority,
          jc.required_completion_date, jc.plant_number, jc.plant_description, jc.plant_status,
          jc.defect, jc.maintenance_schedule, jc.work_request, jc.allocated_trades, jc.status,
          jc.created_at, jc.updated_at, jc.issued_to || null, jc.closed_by_date || null, jc.closed_by_time || null, jc.closure_comment || null
        ]
      );
    }

    // Seed Allocation Sheets
    for (const sheet of SEED_DATA.allocationSheets) {
      await pool.query(
        'INSERT INTO allocation_sheets (id, supervisor, section, date, created_at) VALUES ($1, $2, $3, $4, $5)',
        [sheet.id, sheet.supervisor, sheet.section, sheet.date, sheet.created_at]
      );

      // Seed Rows for this sheet
      const rows = [
        { id: uuidv4(), sheet_id: sheet.id, artisan_name: 'Bob Technician', allocated_task: 'Repair Hydraulic Press #4', job_card_number: 'JC-2026-0002', estimated_time: '4h' },
        { id: uuidv4(), sheet_id: sheet.id, artisan_name: 'Charlie Artisan', allocated_task: 'General Area Inspection', job_card_number: '', estimated_time: '2h' }
      ];

      for (const row of rows) {
        await pool.query(
          'INSERT INTO allocation_rows (id, sheet_id, artisan_name, allocated_task, job_card_number, estimated_time) VALUES ($1, $2, $3, $4, $5, $6)',
          [row.id, row.sheet_id, row.artisan_name, row.allocated_task, row.job_card_number, row.estimated_time]
        );
      }
    }

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
