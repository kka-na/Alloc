import { useState } from 'react'

function AddItemModal({ categoryId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    min_amount: '',
    max_amount: '',
    confirmed_amount: '',
    paid_amount: '',
    is_per_person: false,
    person_count: '1',
    note: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
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
      console.error('Failed to create item:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-alloc-white rounded-t-3xl bottom-sheet max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-alloc-white">
          <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
        </div>

        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold text-alloc-text mb-6">항목 추가</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-alloc-muted mb-1 block">항목 이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="예: 본식 드레스"
                className="w-full bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text focus:outline-none"
                autoFocus
              />
            </div>

            {/* 인원별 체크박스 */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_per_person}
                  onChange={(e) => handleChange('is_per_person', e.target.checked)}
                  className="w-5 h-5 rounded border-alloc-muted/20 text-alloc-tertiary focus:ring-alloc-tertiary"
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
                    className="w-20 bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text text-center focus:outline-none"
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
                  placeholder="0"
                  className="w-full bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text focus:outline-none"
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
                  placeholder="0"
                  className="w-full bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text focus:outline-none"
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
                  className="w-full bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-alloc-muted mb-1 block">지출 금액</label>
                <input
                  type="number"
                  value={form.paid_amount}
                  onChange={(e) => handleChange('paid_amount', e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-b-2 border-alloc-tertiary px-1 py-2 text-alloc-text focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-alloc-muted mb-1 block">메모 (선택)</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="추가 정보 입력"
                rows={2}
                className="w-full bg-transparent border-b-2 border-alloc-muted/50 px-1 py-2 text-alloc-text resize-none focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-alloc-muted/30 text-alloc-muted py-4 rounded-2xl font-semibold text-lg touch-feedback"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !form.name.trim()}
                className="flex-1 bg-alloc-tertiary text-alloc-text py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 touch-feedback"
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

export default AddItemModal
