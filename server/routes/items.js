import { Router } from 'express';
import db from '../db/database.js';
import { nanoid } from 'nanoid';

const router = Router();

// 항목 추가
router.post('/', (req, res) => {
  const { category_id, name, min_amount = 0, max_amount = 0, confirmed_amount = 0, paid_amount = 0, is_per_person = 0, person_count = 1, note = '', sort_order = 0 } = req.body;
  const id = nanoid(10);

  db.prepare(`
    INSERT INTO items (id, category_id, name, min_amount, max_amount, confirmed_amount, paid_amount, is_per_person, person_count, note, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, category_id, name, min_amount, max_amount, confirmed_amount, paid_amount, is_per_person ? 1 : 0, person_count, note, sort_order);

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  const multiplier = item.is_per_person ? item.person_count : 1;
  res.status(201).json({
    ...item,
    avg_amount: (item.min_amount + item.max_amount) / 2 * multiplier,
    remaining: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
    delta: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
    balance: item.confirmed_amount > 0 ? item.confirmed_amount - item.paid_amount : 0
  });
});

// 항목 수정
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name, min_amount, max_amount, confirmed_amount, paid_amount, is_per_person, person_count, note, sort_order } = req.body;

  const updates = [];
  const values = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (min_amount !== undefined) { updates.push('min_amount = ?'); values.push(min_amount); }
  if (max_amount !== undefined) { updates.push('max_amount = ?'); values.push(max_amount); }
  if (confirmed_amount !== undefined) { updates.push('confirmed_amount = ?'); values.push(confirmed_amount); }
  if (paid_amount !== undefined) { updates.push('paid_amount = ?'); values.push(paid_amount); }
  if (is_per_person !== undefined) { updates.push('is_per_person = ?'); values.push(is_per_person ? 1 : 0); }
  if (person_count !== undefined) { updates.push('person_count = ?'); values.push(person_count); }
  if (note !== undefined) { updates.push('note = ?'); values.push(note); }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  const multiplier = item.is_per_person ? item.person_count : 1;
  res.json({
    ...item,
    avg_amount: (item.min_amount + item.max_amount) / 2 * multiplier,
    remaining: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
    delta: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
    balance: item.confirmed_amount > 0 ? item.confirmed_amount - item.paid_amount : 0
  });
});

// 항목 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.status(204).end();
});

// 항목 순서 변경
router.post('/reorder', (req, res) => {
  const { order } = req.body; // array of item IDs in new order

  const stmt = db.prepare('UPDATE items SET sort_order = ? WHERE id = ?');
  order.forEach((id, index) => {
    stmt.run(index, id);
  });

  res.json({ success: true });
});

export default router;
