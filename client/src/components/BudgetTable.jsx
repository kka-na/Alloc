import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CategoryRow from './CategoryRow'
import ItemRow from './ItemRow'
import EditItemModal from './EditItemModal'
import EditCategoryModal from './EditCategoryModal'

function SortableCategory({ category, depth, isExpanded, hasChildren, onToggle, onEdit, formatNumber, compareMode, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={depth === 0 ? 'mb-4 rounded-xl shadow-md overflow-hidden' : ''}>
      <div {...attributes} {...listeners}>
        <CategoryRow
          category={category}
          depth={depth}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggle={onToggle}
          onEdit={onEdit}
          formatNumber={formatNumber}
          compareMode={compareMode}
        />
      </div>
      {children}
    </div>
  )
}

function SortableItem({ item, depth, isLast, formatNumber, onEdit, compareMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemRow
        item={item}
        depth={depth}
        isLast={isLast}
        formatNumber={formatNumber}
        onEdit={onEdit}
        compareMode={compareMode}
      />
    </div>
  )
}

function BudgetTable({ categories, currency, onRefresh, onAddItem, onAddSubcategory, compareMode = 'avg' }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [editingItem, setEditingItem] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

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

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Determine what type of item was dragged
    const activeId = active.id
    const overId = over.id

    // Find which list contains these items
    // Check top-level categories
    const categoryIds = categories.map(c => c.id)
    if (categoryIds.includes(activeId) && categoryIds.includes(overId)) {
      const oldIndex = categoryIds.indexOf(activeId)
      const newIndex = categoryIds.indexOf(overId)
      const newOrder = arrayMove(categoryIds, oldIndex, newIndex)

      await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      })
      onRefresh()
      return
    }

    // Check items within categories
    for (const cat of categories) {
      const itemIds = cat.items?.map(i => i.id) || []
      if (itemIds.includes(activeId) && itemIds.includes(overId)) {
        const oldIndex = itemIds.indexOf(activeId)
        const newIndex = itemIds.indexOf(overId)
        const newOrder = arrayMove(itemIds, oldIndex, newIndex)

        await fetch('/api/items/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder })
        })
        onRefresh()
        return
      }

      // Check subcategories
      const subIds = cat.children?.map(c => c.id) || []
      if (subIds.includes(activeId) && subIds.includes(overId)) {
        const oldIndex = subIds.indexOf(activeId)
        const newIndex = subIds.indexOf(overId)
        const newOrder = arrayMove(subIds, oldIndex, newIndex)

        await fetch('/api/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder })
        })
        onRefresh()
        return
      }

      // Check items in subcategories
      for (const sub of cat.children || []) {
        const subItemIds = sub.items?.map(i => i.id) || []
        if (subItemIds.includes(activeId) && subItemIds.includes(overId)) {
          const oldIndex = subItemIds.indexOf(activeId)
          const newIndex = subItemIds.indexOf(overId)
          const newOrder = arrayMove(subItemIds, oldIndex, newIndex)

          await fetch('/api/items/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
          })
          onRefresh()
          return
        }
      }
    }
  }

  const renderItems = (items, depth, hasMoreChildren) => {
    if (!items || items.length === 0) return null
    const itemIds = items.map(i => i.id)

    return (
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.map((item, idx) => (
          <SortableItem
            key={item.id}
            item={item}
            depth={depth}
            isLast={idx === items.length - 1 && !hasMoreChildren}
            formatNumber={formatNumber}
            onEdit={(item) => setEditingItem(item)}
            compareMode={compareMode}
          />
        ))}
      </SortableContext>
    )
  }

  const renderSubcategories = (children, depth) => {
    if (!children || children.length === 0) return null
    const childIds = children.map(c => c.id)

    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {children.map(child => {
          const isExpanded = expandedCategories.has(child.id)
          const hasChildren = child.children?.length > 0 || child.items?.length > 0

          return (
            <SortableCategory
              key={child.id}
              category={child}
              depth={depth}
              isExpanded={isExpanded}
              hasChildren={hasChildren}
              onToggle={() => toggleCategory(child.id)}
              onEdit={(cat) => setEditingCategory(cat)}
              formatNumber={formatNumber}
              compareMode={compareMode}
            >
              {isExpanded && (
                <div>
                  {renderItems(child.items, depth, child.children?.length > 0)}
                  {renderSubcategories(child.children, depth + 1)}
                </div>
              )}
            </SortableCategory>
          )
        })}
      </SortableContext>
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

  const categoryIds = categories.map(c => c.id)

  return (
    <div className="px-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
          {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id)
            const hasChildren = category.children?.length > 0 || category.items?.length > 0

            return (
              <SortableCategory
                key={category.id}
                category={category}
                depth={0}
                isExpanded={isExpanded}
                hasChildren={hasChildren}
                onToggle={() => toggleCategory(category.id)}
                onEdit={(cat) => setEditingCategory(cat)}
                formatNumber={formatNumber}
                compareMode={compareMode}
              >
                {isExpanded && (
                  <div className="bg-alloc-white">
                    {renderItems(category.items, 0, category.children?.length > 0)}
                    {renderSubcategories(category.children, 1)}
                  </div>
                )}
              </SortableCategory>
            )
          })}
        </SortableContext>
      </DndContext>

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
          onAddSubcategory={(parentId) => {
            setEditingCategory(null)
            onAddSubcategory(parentId)
          }}
          onAddItem={(categoryId) => {
            setEditingCategory(null)
            onAddItem(categoryId)
          }}
        />
      )}
    </div>
  )
}

export default BudgetTable
