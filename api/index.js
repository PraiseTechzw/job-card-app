const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
// For Vercel, you should set DATABASE_URL (e.g. from Vercel Postgres or Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper for DB queries
const query = (text, params) => pool.query(text, params);

// --- JOB CARDS ENDPOINTS ---

app.get('/api/job-cards', async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    // If DB is not connected, return empty for safety or 500
    res.status(500).json({ error: 'Database connection error' });
  }
});

app.get('/api/job-cards/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards', async (req, res) => {
  const data = req.body;
  const ticketNumber = `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  try {
    const result = await query(`
      INSERT INTO job_cards (
        id, ticket_number, requested_by, date_raised, time_raised, priority, 
        required_completion_date, plant_number, plant_description, plant_status, 
        defect, maintenance_schedule, work_request, allocated_trades, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      Math.random().toString(36).substr(2, 9),
      ticketNumber,
      data.requestedBy,
      data.dateRaised,
      data.timeRaised,
      data.priority,
      data.requiredCompletionDate,
      data.plantNumber,
      data.plantDescription,
      data.plantStatus,
      data.defect,
      data.maintenanceSchedule,
      data.workRequest,
      JSON.stringify(data.allocatedTrades),
      data.status || 'Draft'
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/job-cards/:id', async (req, res) => {
  const updates = req.body;
  const fields = Object.keys(updates);
  const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  
  try {
    const result = await query(
      `UPDATE job_cards SET ${setQuery}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(updates)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ALLOCATIONS ENDPOINTS ---

app.get('/api/allocations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM allocations ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/allocations', async (req, res) => {
  const data = req.body;
  try {
    const result = await query(`
      INSERT INTO allocations (
        id, supervisor, section, date, artisan_name, allocated_task, 
        job_card_number, estimated_time, actual_time_taken
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      Math.random().toString(36).substr(2, 9),
      data.supervisor,
      data.section,
      data.date,
      data.artisanName,
      data.allocatedTask,
      data.jobCardNumber,
      data.estimatedTime,
      data.actualTimeTaken
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
