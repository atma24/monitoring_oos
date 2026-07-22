import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Pagination from '../../components/Pagination'
import MainCard from '../../components/MainCard'
import { fetchStocks } from '../../api/stocks'
import type { StockRecord } from '../../types'

const badgeVariant = (cat: string) => {
  if (cat === 'RED') return 'red'
  if (cat === 'YELLOW') return 'yellow'
  if (cat === 'GREEN') return 'green'
  return 'gray'
}

export default function StockList() {
  const [records, setRecords] = useState<StockRecord[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStocks({ stockdate: date, category, page }).then((res) => {
      setRecords(res.data)
      setMeta(res.meta)
    })
  }, [date, category, page])

  return (
    <MainCard title="Data Stock">
      <div className="flex items-center gap-3 mb-4">
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]">
          <option value="">Semua Category</option>
          <option value="RED">RED</option>
          <option value="YELLOW">YELLOW</option>
          <option value="GREEN">GREEN</option>
        </select>
        <input
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1) }}
          type="date"
          className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]"
        />
        <button onClick={() => navigate('/stocks/upload')} className="btn-primary ml-auto">
          Upload Stok
        </button>
      </div>

      <Table
        columns={[
          { key: 'stockdate', label: 'Tanggal', sortable: true },
          { key: 'sap_id', label: 'SAP ID', sortable: true },
          { key: 'outlet_name', label: 'Toko' },
          { key: 'region', label: 'Region' },
          { key: 'dsi', label: 'DSI', sortable: true },
          { key: 'category', label: 'Cat', sortable: true, render: (row: StockRecord) => <Badge variant={badgeVariant(row.category)}>{row.category}</Badge> },
          { key: 'og_urgent_date', label: 'OG Urgent' },
        ]}
        data={records}
        onRowClick={(row) => navigate(`/stocks/${row.store_id}`)}
      />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </MainCard>
  )
}
