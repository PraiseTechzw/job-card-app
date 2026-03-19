import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { isValidTransition } from './workflow.js';
import { createAuditLog } from './audit.js';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const query = (text, params) => pool.query(text, params);

// Utility to convert snake_case to camelCase
const toCamel = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

// Utility to convert camelCase to snake_case
const toSnake = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

// --- JOB CARDS ENDPOINTS ---

app.get('/api/job-cards', async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

app.get('/api/job-cards/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards', async (req, res) => {
  const { performedBy, ...dataBody } = req.body;
  const data = toSnake(dataBody);
  const ticketNumber = `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = Math.random().toString(36).substr(2, 9);
  
  const fields = ['id', 'ticket_number', ...Object.keys(data)];
  const values = [id, ticketNumber, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO job_cards (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    
    // Record Audit Log
    await createAuditLog(
      client, 
      id, 
      'Initial Creation', 
      performedBy || 'System', 
      { ticketNumber }
    );

    await client.query('COMMIT');
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.patch('/api/job-cards/:id', async (req, res) => {
  const { performedBy, userRole, ...updateData } = req.body;
  const updates = toSnake(updateData);
  const fields = Object.keys(updates);
  
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Fetch current job card to check status
    const currentResult = await client.query('SELECT status FROM job_cards WHERE id = $1', [req.params.id]);
    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const currentStatus = currentResult.rows[0].status;
    const nextStatus = updates.status;
    
    // 2. Validate transition if status is being updated
    if (nextStatus && nextStatus !== currentStatus) {
      if (!isValidTransition(currentStatus, nextStatus, userRole)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Invalid status transition from ${currentStatus} to ${nextStatus} for role ${userRole || 'Unknown'}` 
        });
      }
    }

    // 3. Perform update
    const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const updateResult = await client.query(
      `UPDATE job_cards SET ${setQuery}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(updates)]
    );
    
    // 4. Record Audit Log
    const action = nextStatus && nextStatus !== currentStatus ? 'Status Update' : 'Fields Update';
    const auditDetails = {
      fromStatus: currentStatus,
      toStatus: nextStatus || currentStatus,
      changedFields: fields
    };
    
    await createAuditLog(
      client, 
      req.params.id, 
      action, 
      performedBy || 'System', 
      auditDetails
    );

    await client.query('COMMIT');
    res.json(toCamel(updateResult.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Patch failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- ALLOCATION SHEETS ENDPOINTS ---

app.get('/api/allocation-sheets', async (req, res) => {
  try {
    const sheetsResult = await query('SELECT * FROM allocation_sheets ORDER BY date DESC, created_at DESC');
    const sheets = toCamel(sheetsResult.rows);
    
    // Fetch all rows for these sheets
    const rowsResult = await query('SELECT * FROM allocation_rows');
    const allRows = toCamel(rowsResult.rows);
    
    // Group rows by sheet_id
    const sheetsWithRows = sheets.map(sheet => ({
      ...sheet,
      rows: allRows.filter(row => row.sheetId === sheet.id)
    }));
    
    res.json(sheetsWithRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/allocation-sheets', async (req, res) => {
  const { supervisor, section, date, rows } = req.body;
  const sheetId = Math.random().toString(36).substr(2, 9);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert Sheet
    await client.query(
      'INSERT INTO allocation_sheets (id, supervisor, section, date) VALUES ($1, $2, $3, $4)',
      [sheetId, supervisor, section, date]
    );
    
    // 2. Insert Rows
    const insertedRows = [];
    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        const rowId = Math.random().toString(36).substr(2, 9);
        const rResult = await client.query(
          'INSERT INTO allocation_rows (id, sheet_id, artisan_name, allocated_task, job_card_number, estimated_time, actual_time_taken) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [rowId, sheetId, row.artisanName, row.allocatedTask, row.jobCardNumber, row.estimatedTime, row.actualTimeTaken]
        );
        insertedRows.push(toCamel(rResult.rows[0]));
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ 
      id: sheetId, 
      supervisor, 
      section, 
      date, 
      rows: insertedRows 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.patch('/api/allocation-sheets/:id', async (req, res) => {
  const { supervisor, section, date, rows } = req.body;
  const sheetId = req.params.id;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update header
    await client.query(
      'UPDATE allocation_sheets SET supervisor = $1, section = $2, date = $3 WHERE id = $4',
      [supervisor, section, date, sheetId]
    );
    
    // Simpler approach: delete existing rows and re-insert
    await client.query('DELETE FROM allocation_rows WHERE sheet_id = $1', [sheetId]);
    
    const insertedRows = [];
    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        const rowId = Math.random().toString(36).substr(2, 9);
        const rResult = await client.query(
          'INSERT INTO allocation_rows (id, sheet_id, artisan_name, allocated_task, job_card_number, estimated_time, actual_time_taken) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [rowId, sheetId, row.artisanName, row.allocatedTask, row.jobCardNumber, row.estimatedTime, row.actualTimeTaken]
        );
        insertedRows.push(toCamel(rResult.rows[0]));
      }
    }
    
    await client.query('COMMIT');
    res.json({ id: sheetId, supervisor, section, date, rows: insertedRows });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/allocation-sheets/:id', async (req, res) => {
  try {
    await query('DELETE FROM allocation_sheets WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT LOGS ENDPOINTS ---

app.get('/api/audit-logs/:jobCardId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM audit_logs WHERE job_card_id = $1 ORDER BY created_at DESC',
      [req.params.jobCardId]
    );
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  const data = toSnake(req.body);
  const id = Math.random().toString(36).substr(2, 9);
  const fields = ['id', ...Object.keys(data)];
  const values = [id, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO audit_logs (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ASSIGNMENTS ENDPOINTS ---

app.get('/api/assignments', async (req, res) => {
  try {
    const result = await query('SELECT * FROM assignments ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assignments/:jobCardId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM assignments WHERE job_card_id = $1', [req.params.jobCardId]);
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  const data = toSnake(req.body);
  const id = Math.random().toString(36).substr(2, 9);
  const fields = ['id', ...Object.keys(data)];
  const values = [id, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO assignments (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/assignments/:id', async (req, res) => {
  const updates = toSnake(req.body);
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

  try {
    const result = await query(
      `UPDATE assignments SET ${setQuery} WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(updates)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}


