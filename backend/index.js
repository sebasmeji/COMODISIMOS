const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { db, init } = require('./db');

const SECRET = 'dev-secret-change-in-prod';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

init();

// Helpers
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

function authenticate(req, res, next) {
  const token = req.cookies['token'] || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username y password requeridos' });
  const password_hash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, username, password_hash, email) VALUES (?, ?, ?, ?)');
  stmt.run(name || '', username, password_hash, email || null, function (err) {
    if (err) return res.status(400).json({ error: 'Usuario existente o error' });
    const user = { id: this.lastID, username, name: name || '' };
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Credenciales incompletas' });
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Usuario o contraseña inválidos' });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(400).json({ error: 'Usuario o contraseña inválidos' });
    const user = { id: row.id, username: row.username, name: row.name };
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Devuelve el usuario actual según token
app.get('/api/auth/me', authenticate, (req, res) => {
  // Obtener datos frescos desde la base de datos para asegurar que retornamos `name`.
  db.get('SELECT id, username, name FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error leyendo usuario' });
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: { id: row.id, username: row.username, name: row.name } });
  });
});

// Actualizar el nombre del usuario (profile) - requiere auth
app.put('/api/auth/me', authenticate, (req, res) => {
  const { name } = req.body;
  if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name requerido' });
  db.run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'Error actualizando nombre' });
    res.json({ ok: true, name: name.trim() });
  });
});

// Simple password reset prototype: generates token saved in table
app.post('/api/auth/forgot', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username requerido' });
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Usuario no encontrado' });
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    db.run('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)', [row.id, token, expiresAt], function (e) {
      if (e) return res.status(500).json({ error: 'Error al crear token' });
      // En prod: enviar por email. Aquí devolvemos token para pruebas.
      res.json({ ok: true, token });
    });
  });
});

app.post('/api/auth/reset', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token y password requeridos' });
  db.get('SELECT * FROM password_resets WHERE token = ? AND used = 0', [token], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Token inválido' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token expirado' });
    const hash = bcrypt.hashSync(password, 10);
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id], (e) => {
      if (e) return res.status(500).json({ error: 'Error al actualizar contraseña' });
      db.run('UPDATE password_resets SET used = 1 WHERE id = ?', [row.id]);
      res.json({ ok: true });
    });
  });
});

// Preoperacional: crea inspection + preop answers
app.post('/api/preoperacional', authenticate, (req, res) => {
  const userId = req.user.id;
  const { vehicle_type, answers } = req.body; // answers: object
  if (!vehicle_type || !answers) return res.status(400).json({ error: 'vehicle_type y answers requeridos' });
  const preopJson = JSON.stringify(answers);
  const stmt = db.prepare('INSERT INTO inspections (user_id, vehicle_type, preop_answers) VALUES (?, ?, ?)');
  stmt.run(userId, vehicle_type, preopJson, function (err) {
    if (err) return res.status(500).json({ error: 'Error al guardar preoperacional' });
    res.json({ inspectionId: this.lastID });
  });
});

// Selección de proceso
app.post('/api/process', authenticate, (req, res) => {
  const { inspectionId, process } = req.body;
  if (!inspectionId || !process) return res.status(400).json({ error: 'inspectionId y process requeridos' });
  db.run('UPDATE inspections SET process_selected = ? WHERE id = ?', [process, inspectionId], function (err) {
    if (err) return res.status(500).json({ error: 'Error al seleccionar proceso' });
    res.json({ ok: true });
  });
});

// Diagnostic
app.post('/api/diagnostic/:inspectionId', authenticate, (req, res) => {
  const inspectionId = req.params.inspectionId;
  const payload = req.body;
  const stmt = db.prepare(`INSERT INTO diagnostics (
    inspection_id, hygiene_state, conditions, base_type, preserves_original_plastic,
    surface_uniform, body_print, central_sink, lateral_sink, firmness_ok,
    cover_torn, loose_threads, cover_bulging, observations
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(
    inspectionId,
    payload.hygiene_state || null,
    JSON.stringify(payload.conditions || {}),
    payload.base_type || null,
    payload.preserves_original_plastic ? 1 : 0,
    payload.surface_uniform ? 1 : 0,
    payload.body_print ? 1 : 0,
    payload.central_sink ? 1 : 0,
    payload.lateral_sink ? 1 : 0,
    payload.firmness_ok ? 1 : 0,
    payload.cover_torn ? 1 : 0,
    payload.loose_threads ? 1 : 0,
    payload.cover_bulging ? 1 : 0,
    payload.observations || null,
    function (err) {
      if (err) return res.status(500).json({ error: 'Error al guardar diagnóstico' });
      res.json({ ok: true });
    }
  );
});

// Measurements
app.post('/api/measurements/:inspectionId', authenticate, (req, res) => {
  const inspectionId = req.params.inspectionId;
  const p = req.body;
  const stmt = db.prepare(`INSERT INTO measurements (
    inspection_id, length, width, height, backrest_height, plank_state, bed_type, additional_observations, fits_restriction
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(inspectionId, p.length || null, p.width || null, p.height || null, p.backrest_height || null, p.plank_state || null, p.bed_type || null, p.additional_observations || null, p.fits_restriction ? 1 : 0, function (err) {
    if (err) return res.status(500).json({ error: 'Error al guardar medidas' });
    res.json({ ok: true });
  });
});

// Ingreso measurements
app.post('/api/ingreso/:inspectionId', authenticate, (req, res) => {
  const inspectionId = req.params.inspectionId;
  const p = req.body;
  db.run('INSERT INTO ingreso_measurements (inspection_id, length, width, observations, enters) VALUES (?, ?, ?, ?, ?)', [inspectionId, p.length || null, p.width || null, p.observations || null, p.enters ? 1 : 0], function (err) {
    if (err) return res.status(500).json({ error: 'Error al guardar ingreso' });
    res.json({ ok: true });
  });
});

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
  console.log(`COMODISIMOS backend escuchando en http://localhost:${PORT}`);
});
