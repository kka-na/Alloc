function SummaryBar({ summary, currency = 'KRW', compareMode = 'avg' }) {
  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(0) + '만'
    }
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const formatFullNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  // 확정 금액 기준
  const totalConfirmed = summary.total_confirmed || 0
  const totalPaid = summary.total_paid || 0

  // 확정 금액 기준 비교값 (확정 금액 없으면 compareMode로)
  const getCompareValue = () => {
    if (totalConfirmed > 0) return totalConfirmed
    switch (compareMode) {
      case 'min': return summary.total_min
      case 'max': return summary.total_max
      default: return summary.total_avg
    }
  }

  const compareValue = getCompareValue()

  // 확정 진행률 (확정 금액 / 예산 기준)
  const confirmedProgress = summary.total_avg > 0
    ? (totalConfirmed / summary.total_avg) * 100
    : 0

  // 지출 진행률 (지출 / 확정 금액 기준)
  const paidProgress = totalConfirmed > 0
    ? (totalPaid / totalConfirmed) * 100
    : (compareValue > 0 ? (totalPaid / compareValue) * 100 : 0)

  const remaining = compareValue - totalPaid

  return (
    <div className="bg-alloc-white flex-shrink-0 border-b border-alloc-border">
      {/* 메인 진행 상황 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-2xl font-bold text-alloc-text number-highlight">
            {formatFullNumber(totalConfirmed > 0 ? totalConfirmed : totalPaid)}
          </span>
          <span className="text-sm text-alloc-muted">
            / {formatFullNumber(summary.total_avg)} 원
          </span>
        </div>

        {/* 확정 금액 진행 바 */}
        <div className="mb-1">
          <div className="flex items-center justify-end text-xs text-alloc-muted mb-1">
            <span>{confirmedProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-alloc-border rounded-full overflow-hidden relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #5568af 0%, #ec1763 100%)'
              }}
            />
            <div
              className="absolute top-0 right-0 h-full bg-alloc-border transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(100 - confirmedProgress, 0)}%`
              }}
            />
          </div>
        </div>

        {/* 지출 진행 바 (더 작게) */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-alloc-muted mb-0.5">
            <span>지출 {formatNumber(totalPaid)}</span>
            <span>{paidProgress.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-alloc-border rounded-full overflow-hidden relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #cdd629 0%, #f8c9dd 100%)'
              }}
            />
            <div
              className="absolute top-0 right-0 h-full bg-alloc-border transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(100 - paidProgress, 0)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-4 border-t border-alloc-border">
        <div className={`py-3 text-center border-r border-alloc-border ${compareMode === 'min' ? 'bg-alloc-accent/10' : ''}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-0.5 ${compareMode === 'min' ? 'text-alloc-accent' : 'text-alloc-muted'}`}>Min</div>
          <div className={`text-sm font-semibold number-highlight ${compareMode === 'min' ? 'text-alloc-accent' : 'text-alloc-text'}`}>{formatNumber(summary.total_min)}</div>
        </div>
        <div className={`py-3 text-center border-r border-alloc-border ${compareMode === 'avg' ? 'bg-alloc-accent/10' : ''}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-0.5 ${compareMode === 'avg' ? 'text-alloc-accent' : 'text-alloc-muted'}`}>Avg</div>
          <div className={`text-sm font-semibold number-highlight ${compareMode === 'avg' ? 'text-alloc-accent' : 'text-alloc-text'}`}>{formatNumber(summary.total_avg)}</div>
        </div>
        <div className={`py-3 text-center border-r border-alloc-border ${compareMode === 'max' ? 'bg-alloc-accent/10' : ''}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-0.5 ${compareMode === 'max' ? 'text-alloc-accent' : 'text-alloc-muted'}`}>Max</div>
          <div className={`text-sm font-semibold number-highlight ${compareMode === 'max' ? 'text-alloc-accent' : 'text-alloc-text'}`}>{formatNumber(summary.total_max)}</div>
        </div>
        <div className="py-3 text-center">
          <div className="text-[10px] text-alloc-muted uppercase tracking-wide mb-0.5">잔금</div>
          <div className={`text-sm font-semibold number-highlight ${remaining >= 0 ? 'text-alloc-safe' : 'text-alloc-over'}`}>
            {remaining >= 0 ? '' : '-'}{formatNumber(Math.abs(remaining))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
