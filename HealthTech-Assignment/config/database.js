// Uses sql.js CJS build directly to avoid ESM/top-level-await conflict in Node 22
const initSqlJs = require('sql.js/dist/sql-wasm.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/prescription.db');
const WASM_PATH = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');

let db = null;

// initDatabase is async — called once at startup in app.js
async function initDatabase() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WASM_PATH) });

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  createTables();
  persist();
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    UNIQUE NOT NULL,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('doctor','patient')),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id   INTEGER NOT NULL,
      patient_id  INTEGER NOT NULL,
      medicine    TEXT    NOT NULL,
      dosage      TEXT    NOT NULL,
      notes       TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id)  REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);
}

function persist() {
  if (!db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// Execute a write statement and return the last inserted row id
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  persist();
  const res = db.exec('SELECT last_insert_rowid() AS id');
  return res.length ? res[0].values[0][0] : null; // returns plain integer id
}

// Return a single row as a plain object, or null
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

// Return all matching rows as array of plain objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

module.exports = { initDatabase, run, get, all };
