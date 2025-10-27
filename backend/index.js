import express from 'express';
import cors from 'cors';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(process.cwd(), 'mcq.db');

let db;
async function initDb() {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  // create tables if they don't exist (safe)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `);

  // helper that ensures required columns exist on a table (adds missing via ALTER TABLE)
  async function ensureColumns(table, requiredColumns) {
    const existing = await db.all(`PRAGMA table_info('${table}')`);
    const names = existing.map(r => r.name);
    for (const col of requiredColumns) {
      if (!names.includes(col.name)) {
        console.log(`Adding column ${col.name} to ${table}`);
        await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`);
      }
    }
  }

  // required columns for questions/tests/results
  await ensureColumns('questions', [
    { name: 'subject', type: 'TEXT' },
    { name: 'difficulty', type: 'TEXT' },
    { name: 'question', type: 'TEXT' },
    { name: 'option1', type: 'TEXT' },
    { name: 'option2', type: 'TEXT' },
    { name: 'option3', type: 'TEXT' },
    { name: 'option4', type: 'TEXT' },
    { name: 'answer', type: 'INTEGER' },
    { name: 'created_at', type: "TEXT DEFAULT (datetime('now'))" }
  ]);

  await ensureColumns('tests', [
    { name: 'title', type: 'TEXT' },
    { name: 'subject', type: 'TEXT' },
    { name: 'duration', type: 'INTEGER' },
    { name: 'questions', type: 'INTEGER' },
    { name: 'difficulty', type: 'TEXT' },
    { name: 'status', type: 'TEXT' },
    { name: 'created_at', type: "TEXT DEFAULT (datetime('now'))" }
  ]);

  await ensureColumns('results', [
    { name: 'student', type: 'TEXT' },
    { name: 'test', type: 'TEXT' },
    { name: 'score', type: 'REAL' },
    { name: 'data', type: 'TEXT' },
    { name: 'date', type: "TEXT DEFAULT (datetime('now'))" }
  ]);

  console.log('Opened DB at', DB_PATH);
}

initDb().catch(err => {
  console.error('Failed to open DB', err);
  process.exit(1);
});

// --- Questions ---
app.get('/api/questions', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM questions ORDER BY id DESC');
    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read questions' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { subject = '', difficulty = '', question = '', option1 = '', option2 = '', option3 = '', option4 = '', answer = 0 } = req.body;
    const result = await db.run(
      `INSERT INTO questions (subject, difficulty, question, option1, option2, option3, option4, answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      subject, difficulty, question, option1, option2, option3, option4, answer
    );
    const row = await db.get('SELECT * FROM questions WHERE id = ?', result.lastID);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to insert question' });
  }
});

// --- Tests ---
app.get('/api/tests', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM tests ORDER BY id DESC');
    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read tests' });
  }
});

app.post('/api/tests', async (req, res) => {
  try {
    const { title = '', subject = '', duration = 0, questions = 0, difficulty = '', status = 'draft' } = req.body;
    const result = await db.run(
      `INSERT INTO tests (title, subject, duration, questions, difficulty, status) VALUES (?, ?, ?, ?, ?, ?)`,
      title, subject, duration, questions, difficulty, status
    );
    const row = await db.get('SELECT * FROM tests WHERE id = ?', result.lastID);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to insert test' });
  }
});

// --- Results ---
app.get('/api/results', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM results ORDER BY id DESC');
    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read results' });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const { student = '', test = '', score = 0, data = null } = req.body;
    const result = await db.run(
      `INSERT INTO results (student, test, score, data) VALUES (?, ?, ?, ?)`,
      student, test, score, data ? JSON.stringify(data) : null
    );
    const row = await db.get('SELECT * FROM results WHERE id = ?', result.lastID);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to insert result' });
  }
});

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
