function SelectCategoryModal({ categories, onSelect, onClose }) {
  const getAllSubcategories = (cats, parentName = '') => {
    let result = []
    for (const cat of cats) {
      const fullName = parentName ? `${parentName} > ${cat.name}` : cat.name
      if (cat.children && cat.children.length > 0) {
        result = result.concat(getAllSubcategories(cat.children, fullName))
      } else {
        result.push({ ...cat, fullName })
      }
    }
    return result
  }

  const subcategories = getAllSubcategories(categories)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-alloc-bg rounded-t-3xl bottom-sheet max-h-[70vh] overflow-hidden flex flex-col"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-alloc-muted/30 rounded-full" />
        </div>

        <div className="px-6 pb-2">
          <h2 className="text-xl font-bold text-alloc-text">카테고리 선택</h2>
          <p className="text-sm text-alloc-muted mt-1">항목을 추가할 카테고리를 선택하세요</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-2">
            {subcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="w-full text-left bg-white rounded-xl px-4 py-3 touch-feedback border border-alloc-muted/20"
              >
                <span className="text-alloc-text font-medium">{cat.fullName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectCategoryModal
