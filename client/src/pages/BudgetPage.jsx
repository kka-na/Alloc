import { useState, useEffect } from 'react'
import SummaryBar from '../components/SummaryBar'
import BudgetTable from '../components/BudgetTable'
import AddCategoryModal from '../components/AddCategoryModal'
import AddItemModal from '../components/AddItemModal'
import EditBudgetModal from '../components/EditBudgetModal'

function BudgetPage({ budgetId }) {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditBudget, setShowEditBudget] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [parentCategoryId, setParentCategoryId] = useState(null)
  const [compareMode, setCompareMode] = useState(() => {
    return localStorage.getItem('alloc-compare-mode') || 'avg'
  })

  const handleCompareModeChange = (mode) => {
    setCompareMode(mode)
    localStorage.setItem('alloc-compare-mode', mode)
    setShowSettings(false)
  }

  const fetchBudget = async () => {
    try {
      const res = await fetch(`/api/budgets/${budgetId}`)
      const data = await res.json()
      setBudget(data)
    } catch (err) {
      console.error('Failed to fetch budget:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchBudget()
  }, [budgetId])

  const handleAddItem = (categoryId) => {
    setSelectedCategoryId(categoryId)
    setShowAddItem(true)
  }

  const handleAddSubcategory = (parentId) => {
    setParentCategoryId(parentId)
    setShowAddCategory(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-alloc-muted">Loading...</div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-alloc-over">예산을 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-alloc-white">
      {/* Budget Title */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between bg-alloc-white">
        <h2
          className="text-lg font-semibold text-alloc-text touch-feedback cursor-pointer"
          onClick={() => setShowEditBudget(true)}
        >
          {budget.title}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddCategory(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center touch-feedback opacity-60"
            title="카테고리 추가"
          >
            <span className="text-base">📁</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center touch-feedback opacity-60"
            title="설정"
          >
            <svg className="w-5 h-5 text-alloc-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <SummaryBar summary={budget.summary} currency={budget.currency} compareMode={compareMode} />

      {/* Scrollable Content */}
      <div className="flex-1 scroll-container bg-alloc-white" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        {/* Budget Table */}
        <BudgetTable
          categories={budget.categories}
          currency={budget.currency}
          onRefresh={fetchBudget}
          onAddItem={handleAddItem}
          onAddSubcategory={handleAddSubcategory}
          compareMode={compareMode}
        />
      </div>

      {/* Modals */}
      {showEditBudget && (
        <EditBudgetModal
          budget={budget}
          onClose={() => setShowEditBudget(false)}
          onSuccess={() => {
            setShowEditBudget(false)
            fetchBudget()
          }}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          budgetId={budgetId}
          parentId={parentCategoryId}
          onClose={() => {
            setShowAddCategory(false)
            setParentCategoryId(null)
          }}
          onSuccess={() => {
            setShowAddCategory(false)
            setParentCategoryId(null)
            fetchBudget()
          }}
        />
      )}

      {showAddItem && (
        <AddItemModal
          categoryId={selectedCategoryId}
          onClose={() => setShowAddItem(false)}
          onSuccess={() => {
            setShowAddItem(false)
            fetchBudget()
          }}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-alloc-white rounded-t-3xl bottom-sheet"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
            </div>

            <div className="px-6 pb-4">
              <h2 className="text-xl font-bold text-alloc-text mb-4">예산 비교 기준</h2>
              <p className="text-sm text-alloc-muted mb-4">지출 금액과 비교할 기준을 선택하세요</p>

              <div className="space-y-2">
                {[
                  { value: 'min', label: '최소 금액 (Min)', desc: '가장 보수적인 기준' },
                  { value: 'avg', label: '평균 금액 (Avg)', desc: '최소와 최대의 중간값' },
                  { value: 'max', label: '최대 금액 (Max)', desc: '가장 여유로운 기준' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleCompareModeChange(option.value)}
                    className={`w-full text-left rounded-xl px-4 py-3 touch-feedback border ${
                      compareMode === option.value
                        ? 'bg-alloc-accent/10 border-alloc-accent'
                        : 'bg-alloc-white border-alloc-muted/20'
                    }`}
                  >
                    <span className={`font-medium ${compareMode === option.value ? 'text-alloc-accent' : 'text-alloc-text'}`}>
                      {option.label}
                    </span>
                    <p className="text-xs text-alloc-muted mt-0.5">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetPage
