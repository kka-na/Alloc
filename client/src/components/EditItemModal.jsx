import { useState } from 'react'

function EditItemModal({ item, onClose, onSuccess, onDelete, onAddNew }) {
  const [form, setForm] = useState({
    name: item.name,
    min_amount: item.min_amount.toString(),
    max_amount: item.max_amount.toString(),
    confirmed_amount: (item.confirmed_amount || 0).toString(),
    paid_amount: item.paid_amount.toString(),
    is_per_person: item.is_per_person || false,
    person_count: (item.person_count || 1).toString(),
    note: item.note || ''
  })
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          min_amount: parseFloat(form.min_amount) || 0,
          max_amount: parseFloat(form.max_amount) || 0,
          confirmed_amount: parseFloat(form.confirmed_amount) || 0,
          paid_amount: parseFloat(form.paid_amount) || 0,
          is_per_person: form.is_per_person,
          person_count: parseInt(form.person_count) || 1,
          note: form.note.trim()
        })
      })
      onSuccess()
    } catch (err) {
      console.error('Failed to update item:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
      onDelete()
    } catch (err) {
      console.error('Failed to delete item:', err)
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
            <h2 className="text-xl font-bold text-alloc-text mb-2">항목 삭제</h2>
            <p className="text-alloc-muted mb-6">"{item.name}"을(를) 삭제할까요?</p>
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
        className="relative w-full bg-alloc-bg rounded-t-3xl bottom-sheet flex flex-col"
        style={{
          maxHeight: '60vh',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 flex-shrink-0 border-b border-alloc-border">
          <button
            onClick={onClose}
            className="text-alloc-muted text-base"
          >
            취소
          </button>
          <h2 className="text-lg font-bold text-alloc-text">항목 수정</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddNew(item.category_id)}
              className="text-alloc-accent text-sm font-medium"
            >
              +새항목
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-alloc-over text-sm font-medium"
            >
              삭제
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-alloc-muted mb-1 block">항목 이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
              />
            </div>

            {/* 인원별 체크박스 */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_per_person}
                  onChange={(e) => handleChange('is_per_person', e.target.checked)}
                  className="w-5 h-5 rounded border-alloc-border text-alloc-accent focus:ring-alloc-accent"
                />
                <span className="text-sm text-alloc-text">인원별</span>
              </label>
              {form.is_per_person && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.person_count}
                    onChange={(e) => handleChange('person_count', e.target.value)}
                    min="1"
                    className="w-20 bg-white border border-alloc-border rounded-xl px-3 py-2 text-alloc-text text-center focus:outline-none focus:border-alloc-accent"
                  />
                  <span className="text-sm text-alloc-muted">명</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-alloc-muted mb-1 block">
                  {form.is_per_person ? '1인 최소 금액' : '최소 금액'}
                </label>
                <input
                  type="number"
                  value={form.min_amount}
                  onChange={(e) => handleChange('min_amount', e.target.value)}
                  className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
                />
              </div>
              <div>
                <label className="text-sm text-alloc-muted mb-1 block">
                  {form.is_per_person ? '1인 최대 금액' : '최대 금액'}
                </label>
                <input
                  type="number"
                  value={form.max_amount}
                  onChange={(e) => handleChange('max_amount', e.target.value)}
                  className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-alloc-muted mb-1 block">확정 금액</label>
                <input
                  type="number"
                  value={form.confirmed_amount}
                  onChange={(e) => handleChange('confirmed_amount', e.target.value)}
                  placeholder="미정"
                  className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
                />
              </div>
              <div>
                <label className="text-sm text-alloc-muted mb-1 block">지출 금액</label>
                <input
                  type="number"
                  value={form.paid_amount}
                  onChange={(e) => handleChange('paid_amount', e.target.value)}
                  className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text focus:outline-none focus:border-alloc-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-alloc-muted mb-1 block">메모</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows={2}
                className="w-full bg-white border border-alloc-border rounded-xl px-4 py-3 text-alloc-text resize-none focus:outline-none focus:border-alloc-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="w-full bg-alloc-accent text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 touch-feedback"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditItemModal
