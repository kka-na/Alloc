import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// 공유 링크로 예산 조회 (읽기 전용)
router.get('/:token', (req, res) => {
  const { token } = req.params;

  const budget = db.prepare('SELECT * FROM budgets WHERE share_token = ?').get(token);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  // 모든 카테고리 조회
  const categories = db.prepare(`
    SELECT * FROM categories WHERE budget_id = ? ORDER BY sort_order
  `).all(budget.id);

  // 모든 항목 조회
  const items = db.prepare(`
    SELECT i.* FROM items i
    JOIN categories c ON i.category_id = c.id
    WHERE c.budget_id = ?
    ORDER BY i.sort_order
  `).all(budget.id);

  // 항목을 카테고리별로 그룹화
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category_id]) acc[item.category_id] = [];
    acc[item.category_id].push({
      ...item,
      avg_amount: (item.min_amount + item.max_amount) / 2,
      remaining: (item.min_amount + item.max_amount) / 2 - item.paid_amount,
      delta: (item.min_amount + item.max_amount) / 2 - item.paid_amount
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

        const allItems = [...catItems];
        const collectChildItems = (cats) => {
          cats.forEach(c => {
            if (itemsByCategory[c.id]) allItems.push(...itemsByCategory[c.id]);
            if (c.children) collectChildItems(c.children);
          });
        };
        collectChildItems(children);

        const summary = {
          min: allItems.reduce((sum, i) => sum + i.min_amount, 0),
          max: allItems.reduce((sum, i) => sum + i.max_amount, 0),
          avg: allItems.reduce((sum, i) => sum + i.avg_amount, 0),
          paid: allItems.reduce((sum, i) => sum + i.paid_amount, 0)
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

  const summary = {
    total_min: items.reduce((sum, i) => sum + i.min_amount, 0),
    total_max: items.reduce((sum, i) => sum + i.max_amount, 0),
    total_avg: items.reduce((sum, i) => sum + (i.min_amount + i.max_amount) / 2, 0),
    total_paid: items.reduce((sum, i) => sum + i.paid_amount, 0)
  };
  summary.total_remaining = summary.total_avg - summary.total_paid;
  summary.total_delta = summary.total_avg - summary.total_paid;

  res.json({
    ...budget,
    summary,
    categories: tree,
    readonly: true
  });
});

export default router;
