import express from 'express';
import session from 'express-session';
import BetterSqlite3Store from 'better-sqlite3-session-store';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './db.ts';
import authRoutes from './routes/auth.ts';
import inquiryRoutes from './routes/inquiries.ts';
import menuRoutes from './routes/menu.ts';
import pricingRoutes from './routes/pricing.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Body parsing
app.use(express.json());

// Session
const SqliteStore = BetterSqlite3Store(session);
app.use(session({
  store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 900000 } }),
  secret: process.env.SESSION_SECRET || 'sumbar-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pricing', pricingRoutes);

// In production, serve Vite build output
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');

  // Hashed assets (js/css/images) — cache forever
  app.use('/assets', express.static(path.join(distDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // Admin SPA — Vite outputs to dist/src/admin/ for multi-page builds
  const adminDir = path.join(distDir, 'src', 'admin');
  app.use('/admin', express.static(adminDir, { maxAge: 0 }));
  app.get('/admin/{*rest}', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(adminDir, 'admin.html'));
  });

  // Customer form (main SPA)
  app.use(express.static(distDir, { maxAge: 0 }));
  app.get('{*rest}', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
