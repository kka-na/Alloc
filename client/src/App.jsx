import { useState, useEffect, useRef } from 'react'
import BudgetPage from './pages/BudgetPage'

function App() {
  const [budgets, setBudgets] = useState([])
  const [selectedBudgetId, setSelectedBudgetId] = useState(null)
  const [mainBudgetId, setMainBudgetId] = useState(() => localStorage.getItem('mainBudgetId'))
  const [loading, setLoading] = useState(true)
  const [showBudgetList, setShowBudgetList] = useState(false)
  const [swipedBudgetId, setSwipedBudgetId] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null) // 'left' or 'right'

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data)
      if (data.length > 0 && !selectedBudgetId) {
        // 메인 예산이 있으면 그걸 선택, 없으면 첫 번째
        const savedMainId = localStorage.getItem('mainBudgetId')
        const mainExists = data.find(b => b.id === savedMainId)
        setSelectedBudgetId(mainExists ? savedMainId : data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  const setAsMainBudget = (budgetId) => {
    localStorage.setItem('mainBudgetId', budgetId)
    setMainBudgetId(budgetId)
    setSwipedBudgetId(null)
    setSwipeDirection(null)
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
      setBudgets([...budgets, newBudget])
      setSelectedBudgetId(newBudget.id)
    } catch (err) {
      console.error('Failed to create budget:', err)
    }
  }

  const deleteBudget = async (budgetId) => {
    try {
      await fetch(`/api/budgets/${budgetId}`, { method: 'DELETE' })
      const newBudgets = budgets.filter(b => b.id !== budgetId)
      setBudgets(newBudgets)
      if (selectedBudgetId === budgetId) {
        setSelectedBudgetId(newBudgets.length > 0 ? newBudgets[0].id : null)
      }
      setSwipedBudgetId(null)
    } catch (err) {
      console.error('Failed to delete budget:', err)
    }
  }

  const handleBudgetSwipe = (budgetId, e) => {
    const touch = e.changedTouches[0]
    const startX = touch.clientX

    const handleMove = (moveEvent) => {
      const currentX = moveEvent.changedTouches[0].clientX
      const diff = currentX - startX
      if (diff < -80) {
        setSwipedBudgetId(budgetId)
        setSwipeDirection('left')
      } else if (diff > 80) {
        setSwipedBudgetId(budgetId)
        setSwipeDirection('right')
      }
    }

    const handleEnd = () => {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }

    document.addEventListener('touchmove', handleMove)
    document.addEventListener('touchend', handleEnd)
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
          <h1 className="text-xl font-bold text-alloc-accent">Alloc</h1>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => { setShowBudgetList(false); setSwipedBudgetId(null); setSwipeDirection(null); }}>
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
                  <div key={budget.id} className="relative overflow-hidden rounded-xl">
                    {/* 메인 설정 버튼 (오른쪽 스와이프 시 표시) */}
                    <div className={`absolute inset-y-0 left-0 flex items-center transition-all duration-200 ${
                      swipedBudgetId === budget.id && swipeDirection === 'right' ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                      <button
                        onClick={() => setAsMainBudget(budget.id)}
                        className="bg-alloc-secondary text-alloc-text px-4 h-full font-medium"
                      >
                        메인
                      </button>
                    </div>

                    {/* 삭제 버튼 (왼쪽 스와이프 시 표시) */}
                    <div className={`absolute inset-y-0 right-0 flex items-center transition-all duration-200 ${
                      swipedBudgetId === budget.id && swipeDirection === 'left' ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="bg-alloc-over text-white px-4 h-full font-medium"
                      >
                        삭제
                      </button>
                    </div>

                    <button
                      onTouchStart={(e) => handleBudgetSwipe(budget.id, e)}
                      onClick={() => {
                        if (swipedBudgetId === budget.id) {
                          setSwipedBudgetId(null)
                          setSwipeDirection(null)
                        } else {
                          setSelectedBudgetId(budget.id)
                          setShowBudgetList(false)
                        }
                      }}
                      className={`w-full text-left rounded-xl px-4 py-3 touch-feedback border transition-transform duration-200 ${
                        selectedBudgetId === budget.id
                          ? 'bg-alloc-accent/10 border-alloc-accent'
                          : 'bg-alloc-white border-alloc-muted/20'
                      } ${swipedBudgetId === budget.id && swipeDirection === 'left' ? '-translate-x-20' : ''} ${swipedBudgetId === budget.id && swipeDirection === 'right' ? 'translate-x-20' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${selectedBudgetId === budget.id ? 'text-alloc-accent' : 'text-alloc-text'}`}>
                          {budget.title}
                        </span>
                        {mainBudgetId === budget.id && (
                          <span className="text-[10px] bg-alloc-secondary/30 text-alloc-text px-1.5 py-0.5 rounded">메인</span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}

                {/* 예산 추가 버튼 */}
                <button
                  onClick={() => {
                    setShowBudgetList(false)
                    createBudget()
                  }}
                  className="w-full text-center rounded-xl px-4 py-3 border-2 border-dashed border-alloc-muted/30 text-alloc-muted touch-feedback"
                >
                  + 새 예산 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
