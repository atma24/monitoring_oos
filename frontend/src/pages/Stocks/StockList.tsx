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
  const [oos, setOos] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStocks({ stockdate: date, category, oos, page }).then((res) => {
      setRecords(res.data)
      setMeta(res.meta)
    })
  }, [date, category, oos, page])

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
        <select value={oos} onChange={(e) => { setOos(e.target.value); setPage(1) }} className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]">
          <option value="">Semua OOS</option>
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <button onClick={() => navigate('/stocks/upload')} className="btn-primary ml-auto">
          Upload Stok
        </button>
      </div>

      <Table
        columns={[
          { key: 'stockdate', label: 'Tanggal', sortable: true },
          { key: 'sap_id', label: 'SAP ID', sortable: true },
          { key: 'store_id', label: 'Toko', render: (row: StockRecord) => `Toko #${row.store_id}` },
          { key: 'stock', label: 'Stock', sortable: true },
          { key: 'sellout', label: 'SO', sortable: true },
          { key: 'dsi', label: 'DSI', sortable: true },
          { key: 'category', label: 'Cat', sortable: true, render: (row: StockRecord) => <Badge variant={badgeVariant(row.category)}>{row.category}</Badge> },
          { key: 'oos', label: 'OOS', sortable: true, render: (row: StockRecord) => <span className={row.oos === 'YES' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{row.oos}</span> },
          { key: 'og_total', label: 'OG', render: (row: StockRecord) => `${row.og_urgent}/${row.og_total}` },
        ]}
        data={records}
        onRowClick={(row) => navigate(`/stocks/${row.store_id}`)}
      />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </MainCard>
  )
}
