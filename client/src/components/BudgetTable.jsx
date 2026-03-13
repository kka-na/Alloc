import { useState } from 'react'
import CategoryRow from './CategoryRow'
import ItemRow from './ItemRow'
import EditItemModal from './EditItemModal'
import EditCategoryModal from './EditCategoryModal'

function BudgetTable({ categories, currency, onRefresh, onAddItem, compareMode = 'avg' }) {
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const expanded = new Set()
    const addAll = (cats) => {
      cats.forEach(c => {
        expanded.add(c.id)
        if (c.children) addAll(c.children)
      })
    }
    addAll(categories || [])
    return expanded
  })

  const [editingItem, setEditingItem] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const renderCategory = (category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children?.length > 0 || category.items?.length > 0

    return (
      <div key={category.id} className={depth === 0 ? 'mb-4 rounded-xl shadow-md overflow-hidden' : ''}>
        <CategoryRow
          category={category}
          depth={depth}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggle={() => toggleCategory(category.id)}
          onEdit={(cat) => setEditingCategory(cat)}
          formatNumber={formatNumber}
          compareMode={compareMode}
        />

        {isExpanded && (
          <div className={depth === 0 ? 'bg-alloc-white' : ''}>
            {category.items?.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                depth={depth}
                isLast={idx === category.items.length - 1 && !category.children?.length}
                formatNumber={formatNumber}
                onEdit={(item) => setEditingItem(item)}
                compareMode={compareMode}
              />
            ))}
            {category.children?.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-alloc-muted">
        <div className="text-4xl mb-3">📋</div>
        <p>카테고리가 없습니다</p>
        <p className="text-sm mt-1">+ 버튼을 눌러 추가하세요</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      {categories.map(category => renderCategory(category))}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null)
            onRefresh()
          }}
          onDelete={() => {
            setEditingItem(null)
            onRefresh()
          }}
          onAddNew={(categoryId) => {
            setEditingItem(null)
            onAddItem(categoryId)
          }}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null)
            onRefresh()
          }}
          onDelete={() => {
            setEditingCategory(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}

export default BudgetTable
