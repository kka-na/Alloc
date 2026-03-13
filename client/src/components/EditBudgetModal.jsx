import { useState } from 'react'

function EditBudgetModal({ budget, onClose, onSuccess }) {
  const [title, setTitle] = useState(budget.title)
  const [description, setDescription] = useState(budget.description || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await fetch(`/api/budgets/${budget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim()
        })
      })
      onSuccess()
    } catch (err) {
      console.error('Failed to update budget:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-alloc-bg rounded-t-3xl bottom-sheet"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
        </div>

        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold text-alloc-text mb-6">예산 이름 수정</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-alloc-muted mb-1 block">예산 이름</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2025 웨딩 예산"
                className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm text-alloc-muted mb-1 block">설명 (선택)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예산에 대한 간단한 설명"
                rows={2}
                className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text resize-none focus:outline-none focus:border-alloc-accent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-alloc-border text-alloc-muted py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 bg-alloc-accent text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 touch-feedback"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditBudgetModal
