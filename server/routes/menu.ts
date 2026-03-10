import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/requireAuth.ts';

const router = Router();

interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  category: string;
  price_per_person: number;
  is_signature: number;
  is_premium: number;
  dietary_tags: string;
  allergens: string;
  available: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToMenuItem(row: MenuItemRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    pricePerPerson: row.price_per_person,
    isSignature: !!row.is_signature,
    isPremium: !!row.is_premium,
    dietaryTags: JSON.parse(row.dietary_tags),
    allergens: JSON.parse(row.allergens),
    available: !!row.available,
    sortOrder: row.sort_order,
  };
}

// Public: get all menu items
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM menu_items ORDER BY sort_order').all() as MenuItemRow[];
  res.json(rows.map(rowToMenuItem));
});

// Auth: create menu item
router.post('/', requireAuth, (req, res) => {
  const { id, name, description, category, pricePerPerson, isSignature, isPremium, dietaryTags, allergens, available } = req.body;
  if (!id || !name || !category) {
    res.status(400).json({ error: 'id, name, and category are required' });
    return;
  }

  const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM menu_items').get() as { max: number | null };
  const sortOrder = (maxSort.max ?? 0) + 1;

  db.prepare(`
    INSERT INTO menu_items (id, name, description, category, price_per_person, is_signature, is_premium, dietary_tags, allergens, available, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, description || '', category,
    pricePerPerson || 0, isSignature ? 1 : 0, isPremium ? 1 : 0,
    JSON.stringify(dietaryTags || []), JSON.stringify(allergens || []),
    available !== false ? 1 : 0, sortOrder
  );

  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItemRow;
  res.status(201).json(rowToMenuItem(row));
});

// Auth: update menu item
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItemRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const { name, description, category, pricePerPerson, isSignature, isPremium, dietaryTags, allergens, available, sortOrder } = req.body;

  db.prepare(`
    UPDATE menu_items SET
      name = ?, description = ?, category = ?, price_per_person = ?,
      is_signature = ?, is_premium = ?, dietary_tags = ?, allergens = ?,
      available = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    category ?? existing.category,
    pricePerPerson ?? existing.price_per_person,
    (isSignature !== undefined ? (isSignature ? 1 : 0) : existing.is_signature),
    (isPremium !== undefined ? (isPremium ? 1 : 0) : existing.is_premium),
    dietaryTags ? JSON.stringify(dietaryTags) : existing.dietary_tags,
    allergens ? JSON.stringify(allergens) : existing.allergens,
    (available !== undefined ? (available ? 1 : 0) : existing.available),
    sortOrder ?? existing.sort_order,
    id
  );

  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItemRow;
  res.json(rowToMenuItem(row));
});

// Auth: delete menu item
router.delete('/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
