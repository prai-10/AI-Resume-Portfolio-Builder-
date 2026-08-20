/**
 * Database initialization for PostgreSQL (Supabase).
 * Provides a compatibility layer for SQLite queries.
 */
const { Pool } = require('pg');

let pool = null;
let initPromise = null;

function convertSqliteToPostgres(sql, params = []) {
  let pgSql = sql;
  let paramCount = 1;
  
  // Replace SQLite "?" placeholders with PostgreSQL "$1, $2, ..."
  pgSql = pgSql.replace(/\?/g, () => `$${paramCount++}`);
  
  // Replace SQLite datetime('now') with PostgreSQL CURRENT_TIMESTAMP
  pgSql = pgSql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
  
  // Automatically append " RETURNING id" to INSERT statements to fetch inserted ID
  if (/^\s*INSERT\s+INTO/gi.test(pgSql) && !/RETURNING/gi.test(pgSql)) {
    pgSql += ' RETURNING id';
  }
  
  return { pgSql, pgParams: params };
}

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing. Please set it in your .env file or Vercel dashboard.');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Test the connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase PostgreSQL database');
  } catch (err) {
    console.error('❌ Failed to connect to Supabase PostgreSQL database:', err.message);
    throw err;
  }

  // Create tables using PostgreSQL syntax
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      headline TEXT,
      about TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS education (
      id SERIAL PRIMARY KEY,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      start_year TEXT,
      end_year TEXT,
      cgpa TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'technical',
      proficiency TEXT DEFAULT 'intermediate',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      technologies TEXT,
      project_url TEXT,
      github_url TEXT,
      contributions TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      responsibilities TEXT,
      achievements TEXT,
      location TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      date TEXT,
      credential_url TEXT,
      credential_id TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      label TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS generated_documents (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      target_role TEXT,
      target_company TEXT,
      job_description TEXT,
      template TEXT,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default profile row exists (id = 1)
  const result = await pool.query('SELECT id FROM profile WHERE id = 1');
  if (result.rows.length === 0) {
    await pool.query("INSERT INTO profile (id) VALUES (1)");
    console.log('✅ Default profile row created (id=1)');
  }

  console.log('✅ Database schema initialized successfully');
}

async function getDbPool() {
  if (!pool) {
    if (!initPromise) {
      initPromise = initializeDatabase();
    }
    await initPromise;
  }
  return pool;
}

async function queryAll(sql, params = []) {
  const dbPool = await getDbPool();
  const { pgSql, pgParams } = convertSqliteToPostgres(sql, params);
  const result = await dbPool.query(pgSql, pgParams);
  return result.rows;
}

async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function execute(sql, params = []) {
  const dbPool = await getDbPool();
  const { pgSql, pgParams } = convertSqliteToPostgres(sql, params);
  const result = await dbPool.query(pgSql, pgParams);
  
  let lastId = null;
  if (result.rows && result.rows[0]) {
    lastId = result.rows[0].id || null;
  }
  return { lastInsertRowid: lastId };
}

module.exports = { initializeDatabase, getDbPool, queryAll, queryOne, execute };
