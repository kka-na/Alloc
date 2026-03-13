import { useState, useEffect } from 'react'
import BudgetPage from './pages/BudgetPage'

function App() {
  const [budgets, setBudgets] = useState([])
  const [selectedBudgetId, setSelectedBudgetId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBudgetList, setShowBudgetList] = useState(false)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data)
      if (data.length > 0 && !selectedBudgetId) {
        setSelectedBudgetId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  const createBudget = async () => {
    const title = prompt('예산 이름을 입력하세요:')
    if (!title) return

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      const newBudget = await res.json()
      setBudgets([newBudget, ...budgets])
      setSelectedBudgetId(newBudget.id)
    } catch (err) {
      console.error('Failed to create budget:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-alloc-bg flex items-center justify-center">
        <div className="text-alloc-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-alloc-bg">
      {/* Header */}
      <header
        className="bg-alloc-white/90 backdrop-blur-md border-b border-alloc-muted/20 flex-shrink-0"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        <div className="px-4 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-alloc-text">Alloc</h1>
          <div className="flex items-center gap-2">
            {budgets.length > 0 && (
              <button
                onClick={() => setShowBudgetList(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center touch-feedback text-alloc-text"
                title="예산 목록"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <button
              onClick={createBudget}
              className="bg-alloc-accent text-white w-8 h-8 rounded-full text-lg font-medium flex items-center justify-center touch-feedback"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {selectedBudgetId ? (
          <BudgetPage budgetId={selectedBudgetId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-alloc-muted mb-6 text-center">예산이 없습니다</p>
            <button
              onClick={createBudget}
              className="bg-alloc-accent text-white px-8 py-3 rounded-full font-medium touch-feedback"
            >
              첫 예산 만들기
            </button>
          </div>
        )}
      </main>

      {/* Budget List Modal */}
      {showBudgetList && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowBudgetList(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-alloc-white rounded-t-3xl bottom-sheet max-h-[70vh] overflow-hidden flex flex-col"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
            </div>

            <div className="px-6 pb-2">
              <h2 className="text-xl font-bold text-alloc-text">예산 목록</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className="space-y-2">
                {budgets.map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => {
                      setSelectedBudgetId(budget.id)
                      setShowBudgetList(false)
                    }}
                    className={`w-full text-left rounded-xl px-4 py-3 touch-feedback border ${
                      selectedBudgetId === budget.id
                        ? 'bg-alloc-accent/10 border-alloc-accent'
                        : 'bg-alloc-white border-alloc-muted/20'
                    }`}
                  >
                    <span className={`font-medium ${selectedBudgetId === budget.id ? 'text-alloc-accent' : 'text-alloc-text'}`}>
                      {budget.title}
                    </span>
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

export default App
