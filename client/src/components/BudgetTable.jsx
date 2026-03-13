import { useState, useRef, useEffect, createContext, useContext } from 'react'
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

// Context to close all swipes when touching elsewhere
const SwipeContext = createContext({ closeAll: () => {}, register: () => {} })

function SwipeableWrapper({ children, onAdd, addLabel = '+추가' }) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isHorizontal = useRef(null)
  const { closeAll, register } = useContext(SwipeContext)

  const BUTTON_WIDTH = 80

  // Register this swipe's close function
  useEffect(() => {
    const close = () => setOffset(0)
    register(close)
  }, [register])

  const handleTouchStart = (e) => {
    // Close other swipes when starting a new one
    closeAll()
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isHorizontal.current = null
  }

  const handleTouchMove = (e) => {
    const diffX = startX.current - e.touches[0].clientX
    const diffY = Math.abs(e.touches[0].clientY - startY.current)

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(diffX) > 10 || diffY > 10)) {
      isHorizontal.current = Math.abs(diffX) > diffY
    }

    // Only handle horizontal swipes
    if (isHorizontal.current) {
      e.preventDefault()
      const newOffset = Math.max(0, Math.min(BUTTON_WIDTH, diffX))
      setOffset(newOffset)
    }
  }

  const handleTouchEnd = () => {
    if (offset > BUTTON_WIDTH / 2) {
      setOffset(BUTTON_WIDTH)
    } else {
      setOffset(0)
    }
    isHorizontal.current = null
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    setOffset(0)
    onAdd()
  }

  const closeSwipe = () => {
    if (offset > 0) {
      setOffset(0)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Add button (revealed on swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-alloc-accent text-white text-sm font-medium"
        style={{ width: BUTTON_WIDTH }}
        onClick={handleAdd}
      >
        {addLabel}
      </div>

      {/* Content */}
      <div
        className="relative bg-alloc-white"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: offset === 0 || offset === BUTTON_WIDTH ? 'transform 0.2s ease-out' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={offset > 0 ? closeSwipe : undefined}
      >
        {children}
      </div>
    </div>
  )
}

function SortableCategory({ category, depth, isExpanded, hasChildren, onToggle, onEdit, formatNumber, compareMode, onAdd, children }) {
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
      <SwipeableWrapper onAdd={onAdd} addLabel={depth === 0 ? '+서브' : '+항목'}>
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
      </SwipeableWrapper>
      {children}
    </div>
  )
}

function SortableItem({ item, depth, isLast, formatNumber, onEdit, compareMode, onAdd }) {
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
    <div ref={setNodeRef} style={style}>
      <SwipeableWrapper onAdd={onAdd} addLabel="+항목">
        <div {...attributes} {...listeners}>
          <ItemRow
            item={item}
            depth={depth}
            isLast={isLast}
            formatNumber={formatNumber}
            onEdit={onEdit}
            compareMode={compareMode}
          />
        </div>
      </SwipeableWrapper>
    </div>
  )
}

function BudgetTable({ categories, currency, onRefresh, onAddItem, onAddSubcategory, onAddCategory, compareMode = 'avg' }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [editingItem, setEditingItem] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const swipeCloseFunctions = useRef(new Set())

  const swipeContextValue = {
    closeAll: () => {
      swipeCloseFunctions.current.forEach(fn => fn())
    },
    register: (closeFn) => {
      swipeCloseFunctions.current.add(closeFn)
      return () => swipeCloseFunctions.current.delete(closeFn)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
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

    const activeId = active.id
    const overId = over.id

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

    // Check items and subcategories within categories
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

  const renderItems = (items, depth, categoryId, hasMoreChildren) => {
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
            onAdd={() => onAddItem(categoryId)}
          />
        ))}
      </SortableContext>
    )
  }

  const renderSubcategories = (children, depth, parentId) => {
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
              onAdd={() => onAddItem(child.id)}
            >
              {isExpanded && (
                <div>
                  {renderItems(child.items, depth, child.id, child.children?.length > 0)}
                  {renderSubcategories(child.children, depth + 1, child.id)}
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
        <p className="mb-4">카테고리가 없습니다</p>
        <button
          onClick={() => onAddCategory && onAddCategory()}
          className="w-12 h-12 mx-auto flex items-center justify-center text-alloc-muted touch-feedback rounded-full border border-dashed border-alloc-muted/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    )
  }

  const categoryIds = categories.map(c => c.id)

  return (
    <SwipeContext.Provider value={swipeContextValue}>
      <div className="px-4" onClick={() => swipeContextValue.closeAll()}>
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
                onAdd={() => onAddSubcategory(category.id)}
              >
                {isExpanded && (
                  <div className="bg-alloc-white">
                    {renderItems(category.items, 0, category.id, category.children?.length > 0)}
                    {renderSubcategories(category.children, 1, category.id)}
                  </div>
                )}
              </SortableCategory>
            )
          })}
        </SortableContext>
      </DndContext>

      {/* Add Category Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onAddCategory && onAddCategory()
        }}
        className="w-full mt-4 py-3 flex items-center justify-center text-alloc-muted touch-feedback rounded-xl border border-dashed border-alloc-muted/30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
    </SwipeContext.Provider>
  )
}

export default BudgetTable
