import { Router } from 'express';
import db from '../db/database.js';
import { nanoid } from 'nanoid';

const router = Router();

// 카테고리 추가
router.post('/', (req, res) => {
  const { budget_id, parent_id = null, name, sort_order = 0 } = req.body;
  const id = nanoid(10);

  db.prepare(`
    INSERT INTO categories (id, budget_id, parent_id, name, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, budget_id, parent_id, name, sort_order);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.status(201).json(category);
});

// 카테고리 수정
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name, parent_id, sort_order } = req.body;

  const updates = [];
  const values = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (parent_id !== undefined) { updates.push('parent_id = ?'); values.push(parent_id); }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(category);
});

// 카테고리 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.status(204).end();
});

// 카테고리 순서 변경
router.post('/reorder', (req, res) => {
  const { order } = req.body; // array of category IDs in new order

  const stmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
  order.forEach((id, index) => {
    stmt.run(index, id);
  });

  res.json({ success: true });
});

export default router;
