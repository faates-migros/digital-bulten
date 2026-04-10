import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const BULLETINS_FILE = path.join(DATA_DIR, 'bulletins.json');

// Simple JSON-file-based persistence helpers
function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch { /* ignore */ }
  return fallback;
}

function writeJSON(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

interface SessionRow {
  id: string;
  readerId: string;
  isReturning: boolean;
  timestamp: string;
  totalDuration: string;
  totalDurationSec: number;
  completion: number;
  pages: { page: number; time: number }[];
  reactions: string[];
  searchQueries: string[];
  isBounce: boolean;
  clicks: number;
  pdfFileName: string;
}

interface BulletinRow {
  id: string;
  fileName: string;
  uploadedAt: string;
  pageCount: number;
  filePath: string;
}

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.text({ type: 'text/plain', limit: '1mb' }));

// --- Auth API ---

const ADMIN_USER = { username: 'admin', password: 'admin' };
const tokens = new Set<string>();

function generateToken(): string {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = generateToken();
    tokens.add(token);
    return res.json({ ok: true, token, role: 'admin' });
  }
  return res.status(401).json({ ok: false, error: 'Geçersiz kullanıcı adı veya şifre' });
});

app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  if (tokens.has(token)) {
    return res.json({ ok: true, role: 'admin' });
  }
  return res.status(401).json({ ok: false });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  tokens.delete(token);
  res.json({ ok: true });
});

// --- Analytics Sessions API ---

app.get('/api/sessions', (_req, res) => {
  const sessions = readJSON<SessionRow[]>(SESSIONS_FILE, []);
  res.json(sessions);
});

app.post('/api/sessions', (req, res) => {
  const sessions = readJSON<SessionRow[]>(SESSIONS_FILE, []);
  // Handle sendBeacon (text/plain) and regular JSON
  const s: SessionRow = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  // Replace if same id exists, otherwise push
  const idx = sessions.findIndex(x => x.id === s.id);
  if (idx >= 0) sessions[idx] = s;
  else sessions.push(s);
  writeJSON(SESSIONS_FILE, sessions);
  res.json({ ok: true });
});

app.delete('/api/sessions', (_req, res) => {
  writeJSON(SESSIONS_FILE, []);
  res.json({ ok: true });
});

// --- Bulletins API ---

app.get('/api/bulletins', (_req, res) => {
  const bulletins = readJSON<BulletinRow[]>(BULLETINS_FILE, []);
  // Return metadata only (no filePath)
  const safe = bulletins.map(({ filePath, ...rest }) => rest);
  res.json(safe);
});

app.post('/api/bulletins', (req, res) => {
  const bulletins = readJSON<BulletinRow[]>(BULLETINS_FILE, []);
  const { id, fileName, uploadedAt, pageCount, pdfBase64 } = req.body;

  // Check if already exists
  const existing = bulletins.find(b => b.fileName === fileName);
  if (existing) {
    return res.json({ ok: true, exists: true });
  }

  // Save PDF file
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(UPLOADS_DIR, `${id}_${safeName}`);
  const buffer = Buffer.from(pdfBase64, 'base64');
  fs.writeFileSync(filePath, buffer);

  bulletins.push({ id, fileName, uploadedAt, pageCount, filePath });
  writeJSON(BULLETINS_FILE, bulletins);

  res.json({ ok: true });
});

app.get('/api/bulletins/:id/file', (req, res) => {
  const bulletins = readJSON<BulletinRow[]>(BULLETINS_FILE, []);
  const row = bulletins.find(b => b.id === req.params.id);
  if (!row || !fs.existsSync(row.filePath)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${row.fileName}"`);
  res.sendFile(path.resolve(row.filePath));
});

app.delete('/api/bulletins/:id', (req, res) => {
  let bulletins = readJSON<BulletinRow[]>(BULLETINS_FILE, []);
  const row = bulletins.find(b => b.id === req.params.id);
  if (row?.filePath && fs.existsSync(row.filePath)) {
    fs.unlinkSync(row.filePath);
  }
  bulletins = bulletins.filter(b => b.id !== req.params.id);
  writeJSON(BULLETINS_FILE, bulletins);
  res.json({ ok: true });
});

const PORT = Number(process.env.API_PORT) || 3001;
app.listen(PORT, () => {
  console.log(`✓ API server running on http://localhost:${PORT}`);
});
