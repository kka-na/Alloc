import db from './database.js';
import { nanoid } from 'nanoid';

// 기존 데이터 삭제
db.exec('DELETE FROM items');
db.exec('DELETE FROM categories');
db.exec('DELETE FROM budgets');

// 예산 생성
const budgetId = nanoid(10);
db.prepare(`
  INSERT INTO budgets (id, title, description, currency)
  VALUES (?, ?, ?, ?)
`).run(budgetId, '2025 웨딩 예산', '우리 결혼식 예산 관리', 'KRW');

console.log('Created budget:', budgetId);

// 카테고리 및 항목 데이터 (confirmed: 확정 금액, 0이면 미정)
const data = [
  {
    name: '웨딩홀',
    children: [
      {
        name: '대관료',
        items: [
          { name: '꽃, 연출 등', min: 5000000, max: 10000000, confirmed: 7600000, paid: 3800000, note: '그래머시 코엑스 아셈볼룸 - 계약금 50%' }
        ]
      },
      {
        name: '식대',
        items: [
          { name: '150명 기준', min: 9750000, max: 13500000, confirmed: 0, paid: 0, note: '술 답례 포함' }
        ]
      }
    ]
  },
  {
    name: '스드메',
    children: [
      {
        name: '스튜디오',
        items: [
          { name: '아이브', min: 1800000, max: 2500000, confirmed: 2316000, paid: 2316000, note: '완납' }
        ]
      },
      {
        name: '드레스',
        items: [
          { name: '본식 드레스', min: 1500000, max: 3000000, confirmed: 2200000, paid: 500000, note: '계약금 지불' },
          { name: '촬영 드레스', min: 500000, max: 1000000, confirmed: 0, paid: 0, note: '' }
        ]
      },
      {
        name: '메이크업',
        items: [
          { name: '본식 메이크업', min: 800000, max: 1200000, confirmed: 0, paid: 0, note: '' }
        ]
      }
    ]
  },
  {
    name: '예물/예단',
    children: [
      {
        name: '예물',
        items: [
          { name: '반지', min: 3000000, max: 5000000, confirmed: 0, paid: 0, note: '' },
          { name: '시계', min: 2000000, max: 4000000, confirmed: 0, paid: 0, note: '' }
        ]
      },
      {
        name: '예단',
        items: [
          { name: '이불', min: 1000000, max: 2000000, confirmed: 0, paid: 0, note: '' },
          { name: '한복', min: 1500000, max: 3000000, confirmed: 0, paid: 0, note: '' }
        ]
      }
    ]
  },
  {
    name: '허니문',
    children: [
      {
        name: '여행',
        items: [
          { name: '항공권', min: 3000000, max: 5000000, confirmed: 0, paid: 0, note: '' },
          { name: '숙박', min: 2000000, max: 4000000, confirmed: 0, paid: 0, note: '' },
          { name: '현지 경비', min: 1500000, max: 3000000, confirmed: 0, paid: 0, note: '' }
        ]
      }
    ]
  },
  {
    name: '기타',
    children: [
      {
        name: '청첩장/답례품',
        items: [
          { name: '청첩장', min: 200000, max: 500000, confirmed: 0, paid: 0, note: '' },
          { name: '답례품', min: 500000, max: 1000000, confirmed: 0, paid: 0, note: '' }
        ]
      },
      {
        name: '축의금',
        items: [
          { name: '주례/사회', min: 300000, max: 500000, confirmed: 0, paid: 0, note: '' },
          { name: '웨딩플래너', min: 500000, max: 1500000, confirmed: 0, paid: 0, note: '' }
        ]
      }
    ]
  }
];

// 데이터 삽입
let sortOrder = 0;

for (const category of data) {
  const catId = nanoid(10);
  db.prepare(`
    INSERT INTO categories (id, budget_id, parent_id, name, sort_order)
    VALUES (?, ?, NULL, ?, ?)
  `).run(catId, budgetId, category.name, sortOrder++);

  console.log('Created category:', category.name);

  for (const subCat of category.children || []) {
    const subCatId = nanoid(10);
    db.prepare(`
      INSERT INTO categories (id, budget_id, parent_id, name, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(subCatId, budgetId, catId, subCat.name, sortOrder++);

    console.log('  Created subcategory:', subCat.name);

    let itemOrder = 0;
    for (const item of subCat.items || []) {
      const itemId = nanoid(10);
      db.prepare(`
        INSERT INTO items (id, category_id, name, min_amount, max_amount, confirmed_amount, paid_amount, note, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(itemId, subCatId, item.name, item.min, item.max, item.confirmed || 0, item.paid, item.note, itemOrder++);

      console.log('    Created item:', item.name);
    }
  }
}

console.log('\nSeed completed!');
