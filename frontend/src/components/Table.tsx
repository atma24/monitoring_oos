import { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export default function Table<T extends { [k: string]: any }>({ columns, data, onRowClick }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null) return 1
    if (bVal == null) return -1
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="bg-white shadow-[0_1px_20px_0_rgba(69,90,100,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="pc-table w-full text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`${col.sortable ? 'cursor-pointer hover:text-[#04a9f5] select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[10px]">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-[#8996a4]">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
