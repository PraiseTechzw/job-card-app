const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

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
  const data = toSnake(req.body);
  const ticketNumber = `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = Math.random().toString(36).substr(2, 9);
  
  const fields = ['id', 'ticket_number', ...Object.keys(data)];
  const values = [id, ticketNumber, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO job_cards (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/job-cards/:id', async (req, res) => {
  const updates = toSnake(req.body);
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  
  try {
    const result = await query(
      `UPDATE job_cards SET ${setQuery}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(updates)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Card not found' });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ALLOCATIONS ENDPOINTS ---

app.get('/api/allocations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM allocations ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/allocations', async (req, res) => {
  const data = toSnake(req.body);
  const id = Math.random().toString(36).substr(2, 9);
  
  const fields = ['id', ...Object.keys(data)];
  const values = [id, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO allocations (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/allocations/:id', async (req, res) => {
  try {
    await query('DELETE FROM allocations WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}


