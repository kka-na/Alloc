import { Router } from 'express';
import db from '../db/database.js';
import { nanoid } from 'nanoid';

const router = Router();

// 예산 목록 조회
router.get('/', (req, res) => {
  const budgets = db.prepare('SELECT * FROM budgets ORDER BY created_at DESC').all();
  res.json(budgets);
});

// 예산 생성
router.post('/', (req, res) => {
  const { title, description, currency = 'KRW' } = req.body;
  const id = nanoid(10);

  db.prepare(`
    INSERT INTO budgets (id, title, description, currency)
    VALUES (?, ?, ?, ?)
  `).run(id, title, description, currency);

  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  res.status(201).json(budget);
});

// 예산 상세 조회 (트리 구조)
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  // 모든 카테고리 조회
  const categories = db.prepare(`
    SELECT * FROM categories WHERE budget_id = ? ORDER BY sort_order
  `).all(id);

  // 모든 항목 조회
  const items = db.prepare(`
    SELECT i.* FROM items i
    JOIN categories c ON i.category_id = c.id
    WHERE c.budget_id = ?
    ORDER BY i.sort_order
  `).all(id);

  // 항목을 카테고리별로 그룹화
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category_id]) acc[item.category_id] = [];
    const isPerPerson = item.is_per_person === 1 || item.is_per_person === true;
    const multiplier = isPerPerson ? (item.person_count || 1) : 1;
    const baseConfirmed = item.confirmed_amount || 0;
    const totalConfirmedAmount = baseConfirmed * multiplier;
    acc[item.category_id].push({
      ...item,
      is_per_person: isPerPerson,
      avg_amount: (item.min_amount + item.max_amount) / 2 * multiplier,
      total_min: item.min_amount * multiplier,
      total_max: item.max_amount * multiplier,
      total_confirmed: totalConfirmedAmount,
      remaining: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
      delta: (item.min_amount + item.max_amount) / 2 * multiplier - item.paid_amount,
      balance: totalConfirmedAmount > 0 ? totalConfirmedAmount - item.paid_amount : 0
    });
    return acc;
  }, {});

  // 카테고리를 트리 구조로 변환
  const buildTree = (parentId = null) => {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(category => {
        const catItems = itemsByCategory[category.id] || [];
        const children = buildTree(category.id);

        // 카테고리 요약 계산
        const allItems = [...catItems];
        const collectChildItems = (cats) => {
          cats.forEach(c => {
            if (itemsByCategory[c.id]) allItems.push(...itemsByCategory[c.id]);
            if (c.children) collectChildItems(c.children);
          });
        };
        collectChildItems(children);

        const totalConfirmed = allItems.reduce((sum, i) => sum + (i.total_confirmed || i.confirmed_amount || 0), 0);
        const summary = {
          min: allItems.reduce((sum, i) => sum + (i.total_min || i.min_amount), 0),
          max: allItems.reduce((sum, i) => sum + (i.total_max || i.max_amount), 0),
          avg: allItems.reduce((sum, i) => sum + i.avg_amount, 0),
          confirmed: totalConfirmed,
          paid: allItems.reduce((sum, i) => sum + i.paid_amount, 0),
          balance: totalConfirmed - allItems.reduce((sum, i) => sum + i.paid_amount, 0)
        };

        return {
          ...category,
          items: catItems,
          children,
          summary
        };
      });
  };

  const tree = buildTree();

  // 전체 요약 계산 (인원별 항목은 곱셈 적용)
  const totalConfirmed = items.reduce((sum, i) => {
    const isPerPerson = i.is_per_person === 1 || i.is_per_person === true;
    const multiplier = isPerPerson ? (i.person_count || 1) : 1;
    return sum + (i.confirmed_amount || 0) * multiplier;
  }, 0);
  const summary = {
    total_min: items.reduce((sum, i) => {
      const isPerPerson = i.is_per_person === 1 || i.is_per_person === true;
      const multiplier = isPerPerson ? (i.person_count || 1) : 1;
      return sum + i.min_amount * multiplier;
    }, 0),
    total_max: items.reduce((sum, i) => {
      const isPerPerson = i.is_per_person === 1 || i.is_per_person === true;
      const multiplier = isPerPerson ? (i.person_count || 1) : 1;
      return sum + i.max_amount * multiplier;
    }, 0),
    total_avg: items.reduce((sum, i) => {
      const isPerPerson = i.is_per_person === 1 || i.is_per_person === true;
      const multiplier = isPerPerson ? (i.person_count || 1) : 1;
      return sum + (i.min_amount + i.max_amount) / 2 * multiplier;
    }, 0),
    total_confirmed: totalConfirmed,
    total_paid: items.reduce((sum, i) => sum + i.paid_amount, 0),
    total_balance: totalConfirmed - items.reduce((sum, i) => sum + i.paid_amount, 0)
  };
  summary.total_remaining = summary.total_avg - summary.total_paid;
  summary.total_delta = summary.total_avg - summary.total_paid;

  res.json({
    ...budget,
    summary,
    categories: tree
  });
});

// 예산 수정
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, currency } = req.body;

  const updates = [];
  const values = [];

  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (currency !== undefined) { updates.push('currency = ?'); values.push(currency); }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  res.json(budget);
});

// 예산 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
  res.status(204).end();
});

// 공유 토큰 생성/조회
router.get('/:id/share', (req, res) => {
  const { id } = req.params;
  let budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);

  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  if (!budget.share_token) {
    const shareToken = nanoid(16);
    db.prepare('UPDATE budgets SET share_token = ? WHERE id = ?').run(shareToken, id);
    budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  }

  res.json({ share_token: budget.share_token });
});

export default router;
