import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/requireAuth.ts';

const router = Router();

interface SettingRow {
  key: string;
  value: string;
}

interface RentalFeeRow {
  id: number;
  day_of_week: number;
  day_label: string;
  fee: number;
  sort_order: number;
}

// Public: get all site settings
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM site_settings').all() as SettingRow[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

// Auth: update a setting
router.put('/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) {
    res.status(400).json({ error: 'value is required' });
    return;
  }
  db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, String(value), String(value));
  res.json({ key, value: String(value) });
});

// Public: get rental fees
router.get('/rental-fees', (_req, res) => {
  const rows = db.prepare('SELECT * FROM rental_fees ORDER BY sort_order').all() as RentalFeeRow[];
  res.json(rows.map((r) => ({
    id: r.id,
    dayOfWeek: r.day_of_week,
    dayLabel: r.day_label,
    fee: r.fee,
  })));
});

// Auth: update rental fee for a day
router.put('/rental-fees/:dayOfWeek', requireAuth, (req, res) => {
  const dayOfWeek = Number(req.params.dayOfWeek);
  const { fee } = req.body;
  if (fee === undefined) {
    res.status(400).json({ error: 'fee is required' });
    return;
  }
  const existing = db.prepare('SELECT * FROM rental_fees WHERE day_of_week = ?').get(dayOfWeek) as RentalFeeRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Day not found' });
    return;
  }
  db.prepare('UPDATE rental_fees SET fee = ? WHERE day_of_week = ?').run(Number(fee), dayOfWeek);
  res.json({ dayOfWeek, dayLabel: existing.day_label, fee: Number(fee) });
});

export default router;
