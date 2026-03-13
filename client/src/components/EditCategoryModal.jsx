import { useState } from 'react'

function EditCategoryModal({ category, onClose, onSuccess, onDelete, onAddSubcategory }) {
  const [name, setName] = useState(category.name)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      onSuccess()
    } catch (err) {
      console.error('Failed to update category:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      onDelete()
    } catch (err) {
      console.error('Failed to delete category:', err)
    } finally {
      setLoading(false)
    }
  }

  if (showDeleteConfirm) {
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
          <div className="px-6 pb-4 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-xl font-bold text-alloc-text mb-2">카테고리 삭제</h2>
            <p className="text-alloc-muted mb-2">"{category.name}"을(를) 삭제할까요?</p>
            <p className="text-sm text-alloc-over mb-6">하위 항목도 모두 삭제됩니다</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-alloc-border text-alloc-muted py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-alloc-over text-white py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-alloc-text">카테고리 수정</h2>
            <div className="flex items-center gap-2">
              {onAddSubcategory && (
                <button
                  onClick={() => onAddSubcategory(category.id)}
                  className="text-alloc-accent bg-alloc-accent/10 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  +서브
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-alloc-over bg-alloc-over/10 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                삭제
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름"
              className="w-full bg-white border border-alloc-border rounded-2xl px-5 py-4 text-alloc-text text-lg mb-6 focus:outline-none focus:border-alloc-accent"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-alloc-border text-alloc-muted py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
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

export default EditCategoryModal
