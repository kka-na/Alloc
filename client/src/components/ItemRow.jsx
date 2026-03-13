function ItemRow({ item, depth, isLast, formatNumber, onEdit, compareMode = 'avg' }) {
  const isPerPerson = item.is_per_person
  const personCount = item.person_count || 1
  const multiplier = isPerPerson ? personCount : 1

  // 인원별 항목은 이미 API에서 곱셈이 적용됨
  const totalMin = item.total_min || item.min_amount * multiplier
  const totalMax = item.total_max || item.max_amount * multiplier
  const confirmed = item.total_confirmed || (item.confirmed_amount || 0) * multiplier
  const isConfirmed = confirmed > 0

  const getCompareValue = () => {
    // 확정 금액이 있으면 그걸 기준으로, 없으면 compareMode에 따라
    if (isConfirmed) return confirmed
    switch (compareMode) {
      case 'min': return totalMin
      case 'max': return totalMax
      default: return item.avg_amount
    }
  }

  const compareValue = getCompareValue()
  const delta = compareValue - item.paid_amount
  const balance = isConfirmed ? confirmed - item.paid_amount : 0
  const isOver = delta < 0
  const statusColor = isOver ? 'bg-alloc-over' : 'bg-alloc-safe'

  const progress = compareValue > 0 ? (item.paid_amount / compareValue) * 100 : 0

  return (
    <div
      className={`px-4 py-3 bg-alloc-white ${!isLast ? 'border-b border-alloc-card-body' : ''} touch-feedback cursor-pointer`}
      onClick={() => onEdit(item)}
    >
      {/* 항목명 + 상태 표시 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <span className={`w-2 h-2 rounded-full ${statusColor} flex-shrink-0`} />
          <span className="text-alloc-text font-medium">{item.name}</span>
          {isPerPerson && (
            <span className="text-[10px] bg-alloc-muted/20 text-alloc-muted px-1.5 py-0.5 rounded">{personCount}명</span>
          )}
          {isConfirmed && (
            <span className="text-[10px] bg-alloc-accent/20 text-alloc-accent px-1.5 py-0.5 rounded">확정</span>
          )}
        </div>
        {isConfirmed ? (
          <span className={`text-sm font-semibold number-highlight ${balance > 0 ? 'text-alloc-over' : 'text-alloc-safe'}`}>
            {balance > 0 ? `잔금 ${formatNumber(balance)}` : '완납'}
          </span>
        ) : (
          <span className={`text-sm font-semibold number-highlight ${isOver ? 'text-alloc-over' : 'text-alloc-safe'}`}>
            {delta >= 0 ? '+' : ''}{formatNumber(delta)}
          </span>
        )}
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-alloc-border rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-300 ${progress > 100 ? 'bg-alloc-over' : progress > 80 ? 'bg-alloc-over/70' : 'bg-alloc-safe'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* 금액 정보 */}
      <div className="flex items-center justify-between text-sm">
        {isConfirmed ? (
          <div className="text-alloc-muted">
            <span className="text-xs">확정</span>
            <span className="number-highlight ml-1 text-alloc-text font-medium">{formatNumber(confirmed)}</span>
            {isPerPerson && (
              <span className="text-[10px] ml-1">({formatNumber(item.confirmed_amount)}×{personCount})</span>
            )}
          </div>
        ) : (
          <div className="text-alloc-muted">
            <span className="number-highlight">{formatNumber(totalMin)}</span>
            <span className="mx-1">~</span>
            <span className="number-highlight">{formatNumber(totalMax)}</span>
            {isPerPerson && (
              <span className="text-[10px] ml-1">({formatNumber(item.min_amount)}×{personCount})</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-xs text-alloc-muted">지출</span>
          <span className="text-alloc-accent font-semibold number-highlight">
            {formatNumber(item.paid_amount)}
          </span>
        </div>
      </div>

      {/* 메모 */}
      {item.note && (
        <div className="mt-2 text-xs text-alloc-muted/70 truncate">
          {item.note}
        </div>
      )}
    </div>
  )
}

export default ItemRow
