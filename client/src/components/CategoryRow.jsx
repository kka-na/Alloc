function CategoryRow({ category, depth, isExpanded, hasChildren, onToggle, onEdit, formatNumber, compareMode = 'avg' }) {
  const isTopLevel = depth === 0
  const hasConfirmed = category.summary && category.summary.confirmed > 0

  // 예산 기준값 (설정에 따라 min/avg/max)
  const getBudgetBase = () => {
    if (!category.summary) return 0
    switch (compareMode) {
      case 'min': return category.summary.min
      case 'max': return category.summary.max
      default: return category.summary.avg
    }
  }

  const budgetBase = getBudgetBase()
  const confirmed = category.summary?.confirmed || 0
  const paid = category.summary?.paid || 0

  // 지출 비교 기준 (확정 금액 있으면 확정, 없으면 예산 기준)
  const compareValue = hasConfirmed ? confirmed : budgetBase
  // 초과 여부: 지출 초과 또는 확정금액이 예산 초과
  const isOver = paid > compareValue || (hasConfirmed && confirmed > budgetBase)

  // 확정 달성률 (확정 금액 / 예산 기준)
  const confirmedRate = hasConfirmed && budgetBase > 0
    ? (confirmed / budgetBase) * 100
    : 0

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 touch-feedback
        ${isTopLevel
          ? 'bg-alloc-accent text-white rounded-t-xl'
          : 'bg-alloc-white border-b border-alloc-muted/20'
        }
      `}
      onClick={onToggle}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onEdit(category)
      }}
    >
      <div className="flex items-center gap-2" style={{ paddingLeft: isTopLevel ? 0 : `${(depth - 1) * 12}px` }}>
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isTopLevel ? 'text-white/70' : 'text-alloc-muted'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}

        {/* Status Indicator - Arrow */}
        {category.summary && compareValue > 0 && (
          <svg
            className={`w-4 h-4 ${isOver ? 'text-alloc-over' : 'text-alloc-safe'} ${isTopLevel ? 'opacity-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOver ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        )}

        {/* Category Name */}
        <span className={`font-medium ${isTopLevel ? 'text-white' : 'text-alloc-text'}`}>
          {category.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Summary - 접혀있을 때 달성률 표시 */}
        {category.summary && (
          <>
            {!isExpanded && hasConfirmed ? (
              <div className={`text-sm font-semibold ${isTopLevel ? 'text-white' : confirmedRate > 100 ? 'text-alloc-over' : 'text-alloc-safe'}`}>
                {confirmedRate.toFixed(1)}%
              </div>
            ) : (
              <div className={`text-sm ${isTopLevel ? 'text-white/80' : 'text-alloc-muted'}`}>
                <span className="number-highlight">{formatNumber(paid)}</span>
                <span className="mx-1 opacity-50">/</span>
                <span className="number-highlight">{formatNumber(compareValue)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CategoryRow
