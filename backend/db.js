const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'comodisimos.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'sql', 'schema.sql');

function ensureDataDir() {
  const dir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

ensureDataDir();

const db = new sqlite3.Database(DB_PATH);

function init() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema, (err) => {
    if (err) console.error('Error al inicializar DB:', err);
  });
}

module.exports = { db, init };
