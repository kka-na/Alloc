import { useState } from 'react'

function AddCategoryModal({ budgetId, parentId = null, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_id: budgetId,
          parent_id: parentId,
          name: name.trim()
        })
      })
      onSuccess()
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
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
          <h2 className="text-xl font-bold text-alloc-text mb-6">
            {parentId ? '서브카테고리 추가' : '카테고리 추가'}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름"
              className="w-full bg-white border border-alloc-muted/20 rounded-2xl px-5 py-4 text-alloc-text text-lg mb-6 focus:outline-none focus:border-alloc-accent"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-alloc-muted/30 text-alloc-muted py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-alloc-accent text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 touch-feedback"
              >
                {loading ? '저장 중...' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddCategoryModal
