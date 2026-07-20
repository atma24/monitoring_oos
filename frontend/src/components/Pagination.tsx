interface PaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(lastPage, currentPage + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  const btn = (page: number, label?: string, disabled = false) => (
    <button
      onClick={() => onPageChange(page)}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm border transition-colors ${
        page === currentPage
          ? 'bg-[#04a9f5] text-white border-[#04a9f5]'
          : 'bg-white text-[#888] border-[#dbe0e5] hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ borderRadius: 0 }}
    >
      {label ?? page}
    </button>
  )

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-[#888]">Page {currentPage} of {lastPage}</p>
      <div className="flex items-center gap-0.5">
        {btn(currentPage - 1, '\u00AB', currentPage === 1)}
        {start > 1 && <span className="px-2 text-[#8996a4]">...</span>}
        {pages.map((p) => btn(p))}
        {end < lastPage && <span className="px-2 text-[#8996a4]">...</span>}
        {btn(currentPage + 1, '\u00BB', currentPage === lastPage)}
      </div>
    </div>
  )
}
