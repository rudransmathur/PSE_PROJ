import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Open SQLite DB
let db;
(async () => {
  db = await open({
    filename: './mcq.db',
    driver: sqlite3.Database
  });
  // Create tables if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT,
      difficulty TEXT,
      question_text TEXT,
      option1 TEXT,
      option2 TEXT,
      option3 TEXT,
      option4 TEXT,
      correct_option INTEGER,
      created_by INTEGER
    );
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subject TEXT,
      date_created TEXT,
      duration INTEGER,
      difficulty TEXT,
      created_by INTEGER,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS test_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER,
      question_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER,
      student_id INTEGER,
      date_submitted TEXT,
      score INTEGER
    );
    CREATE TABLE IF NOT EXISTS submission_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER,
      question_id INTEGER,
      selected_option INTEGER,
      is_correct BOOLEAN
    );
  `);
  console.log('Database initialized');
})();

app.get('/', (req, res) => {
  res.send('MCQ Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
