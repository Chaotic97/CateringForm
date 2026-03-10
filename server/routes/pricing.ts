import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/requireAuth.ts';

const router = Router();

interface PricingRow {
  id: number;
  type: string;
  key: string;
  label: string;
  description: string;
  price_per_person_low: number;
  price_per_person_high: number;
  minimum_headcount: number | null;
  included_courses: number | null;
  sort_order: number;
}

function rowToTier(row: PricingRow) {
  return {
    id: row.id,
    type: row.type,
    key: row.key,
    label: row.label,
    description: row.description,
    pricePerPersonLow: row.price_per_person_low,
    pricePerPersonHigh: row.price_per_person_high,
    minimumHeadcount: row.minimum_headcount,
    includedCourses: row.included_courses,
    sortOrder: row.sort_order,
  };
}

// Public: get all pricing tiers
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM pricing_tiers ORDER BY type, sort_order').all() as PricingRow[];
  res.json(rows.map(rowToTier));
});

// Auth: update a pricing tier by key
router.put('/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  const existing = db.prepare('SELECT * FROM pricing_tiers WHERE key = ?').get(key) as PricingRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Pricing tier not found' });
    return;
  }

  const { label, description, pricePerPersonLow, pricePerPersonHigh, minimumHeadcount, includedCourses } = req.body;

  db.prepare(`
    UPDATE pricing_tiers SET
      label = ?, description = ?, price_per_person_low = ?, price_per_person_high = ?,
      minimum_headcount = ?, included_courses = ?
    WHERE key = ?
  `).run(
    label ?? existing.label,
    description ?? existing.description,
    pricePerPersonLow ?? existing.price_per_person_low,
    pricePerPersonHigh ?? existing.price_per_person_high,
    minimumHeadcount !== undefined ? minimumHeadcount : existing.minimum_headcount,
    includedCourses !== undefined ? includedCourses : existing.included_courses,
    key
  );

  const row = db.prepare('SELECT * FROM pricing_tiers WHERE key = ?').get(key) as PricingRow;
  res.json(rowToTier(row));
});

export default router;
