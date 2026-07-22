import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'
import MainCard from '../../components/MainCard'
import { fetchStore } from '../../api/stores'
import type { Store, StockRecord } from '../../types'

const badgeVariant = (cat: string) => {
  if (cat === 'RED') return 'red'
  if (cat === 'YELLOW') return 'yellow'
  if (cat === 'GREEN') return 'green'
  return 'gray'
}

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | null>(null)
  const [history, setHistory] = useState<StockRecord[]>([])

  useEffect(() => {
    if (id) fetchStore(Number(id)).then((res) => {
      setStore(res.data)
      setHistory(res.stock_history)
    })
  }, [id])

  if (!store) return <div className="text-[#8996a4]">Loading...</div>

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/stores')} className="text-sm text-[#04a9f5] hover:underline">&larr; Kembali</button>

      <MainCard>
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-base font-semibold text-[#262626]">{store.outlet_name}</h5>
          <Badge variant={badgeVariant(store.category)}>{store.category}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-[#8996a4]">SAP ID:</span> <span className="font-mono">{store.sap_id}</span></div>
          <div><span className="text-[#8996a4]">Alamat:</span> {[store.street, store.city, store.postal_code].filter(Boolean).join(', ') || '-'}</div>
          <div><span className="text-[#8996a4]">DSI:</span> {store.dsi}</div>
          <div><span className="text-[#8996a4]">Category:</span> <Badge variant={badgeVariant(store.category)}>{store.category}</Badge></div>
        </div>
      </MainCard>

      <MainCard title="Riwayat Stok (30 hari)">
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
              {history.map((r) => (
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
