import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'
import StatCard from '../../components/StatCard'
import MainCard from '../../components/MainCard'
import { fetchStockHistory } from '../../api/stocks'
import type { StockRecord } from '../../types'

const badgeVariant = (cat: string) => {
  if (cat === 'RED') return 'red'
  if (cat === 'YELLOW') return 'yellow'
  if (cat === 'GREEN') return 'green'
  return 'gray'
}

export default function StockDetail() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const [records, setRecords] = useState<StockRecord[]>([])

  useEffect(() => {
    if (storeId) fetchStockHistory(Number(storeId)).then((res) => setRecords(res.data))
  }, [storeId])

  const latest = records[0]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/stocks')} className="text-sm text-[#04a9f5] hover:underline">&larr; Kembali</button>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="bar-chart" label="DSI Terakhir" value={latest?.dsi ?? 0} />
        <StatCard icon="check-circle" label="Hari Data" value={records.length} />
        <StatCard icon="alert-circle" label="Category" value={latest?.category ?? '-'} />
        <StatCard icon="clock" label="JWK" value={latest?.jwk ?? '-'} />
      </div>

      <MainCard title="Riwayat Stok (90 hari)">
        <div className="overflow-x-auto">
          <table className="pc-table w-full text-sm">
            <thead>
              <tr>
                {['Tanggal', 'DSI', 'Category', 'OG Urgent'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.stockdate}</td>
                  <td>{r.dsi}</td>
                  <td><Badge variant={badgeVariant(r.category)}>{r.category}</Badge></td>
                  <td>{r.og_urgent_date ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MainCard>
    </div>
  )
}
