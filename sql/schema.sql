-- Esquema SQL relacional inicial para COMODISIMOS

PRAGMA foreign_keys = ON;

-- Usuarios (inspectores)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inspecciones (registro principal por flujo operativo)
CREATE TABLE IF NOT EXISTS inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vehicle_type TEXT NOT NULL, -- 'carro'|'moto'
  preop_answers TEXT NOT NULL, -- JSON con respuestas SI/NO
  process_selected TEXT, -- 'diagnostico'|'toma_medidas'|'toma_ingreso'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Diagnóstico
CREATE TABLE IF NOT EXISTS diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_id INTEGER NOT NULL,
  hygiene_state TEXT,
  conditions TEXT, -- JSON or CSV con derrames, huella, etc.
  base_type TEXT,
  preserves_original_plastic INTEGER,
  surface_uniform INTEGER,
  body_print INTEGER,
  central_sink INTEGER,
  lateral_sink INTEGER,
  firmness_ok INTEGER,
  cover_torn INTEGER,
  loose_threads INTEGER,
  cover_bulging INTEGER,
  observations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- Toma de medidas
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_id INTEGER NOT NULL,
  length REAL,
  width REAL,
  height REAL,
  backrest_height REAL,
  plank_state TEXT,
  bed_type TEXT,
  additional_observations TEXT,
  fits_restriction INTEGER, -- 1 = SI, 0 = NO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- Toma de medidas de ingreso
CREATE TABLE IF NOT EXISTS ingreso_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_id INTEGER NOT NULL,
  length REAL,
  width REAL,
  observations TEXT,
  enters INTEGER, -- 1 = SI, 0 = NO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- Tokens de recuperación (prototipo)
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
