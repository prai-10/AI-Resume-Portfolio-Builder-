/**
 * Database initialization using sql.js (pure WebAssembly SQLite — no native compilation needed).
 * The database is loaded from disk on startup and saved after every write operation.
 */
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'resume_builder.db');
const DATA_DIR = path.join(__dirname, '..', 'data');

let db = null;
let SQL = null;

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

async function initializeDatabase() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load sql.js
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Database loaded from:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ New database created at:', DB_PATH);
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      headline TEXT,
      about TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      start_year TEXT,
      end_year TEXT,
      cgpa TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'technical',
      proficiency TEXT DEFAULT 'intermediate',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      technologies TEXT,
      project_url TEXT,
      github_url TEXT,
      contributions TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      responsibilities TEXT,
      achievements TEXT,
      location TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      date TEXT,
      credential_url TEXT,
      credential_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      label TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS generated_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT,
      target_role TEXT,
      target_company TEXT,
      job_description TEXT,
      template TEXT,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Ensure default profile row exists
  const result = db.exec('SELECT id FROM profile WHERE id = 1');
  if (!result.length || !result[0].values.length) {
    db.run("INSERT INTO profile (id) VALUES (1)");
    saveDb();
  }

  console.log('✅ Database schema initialized successfully');
}

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Execute a SELECT query and return all rows as objects.
 */
function queryAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a SELECT query and return the first row as object.
 */
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT/UPDATE/DELETE and return lastInsertRowid.
 */
function execute(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  const lastId = result[0]?.values[0]?.[0] || null;
  saveDb();
  return { lastInsertRowid: lastId };
}

module.exports = { initializeDatabase, getDb, queryAll, queryOne, execute, saveDb };
