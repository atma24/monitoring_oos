import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Pagination from '../../components/Pagination'
import MainCard from '../../components/MainCard'
import { fetchStores } from '../../api/stores'
import type { Store } from '../../types'

const badgeVariant = (cat: string) => {
  if (cat === 'RED') return 'red'
  if (cat === 'YELLOW') return 'yellow'
  if (cat === 'GREEN') return 'green'
  return 'gray'
}

const deliveryBadge = (status: string | null) => {
  if (status === 'UNDELIVERED') return { variant: 'orange' as const, text: 'Blm Kirim' }
  if (status === 'DELIVERED') return { variant: 'green' as const, text: 'Terkirim' }
  return { variant: 'gray' as const, text: '-' }
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores({ search, region, page }).then((res) => {
      setStores(res.data)
      setMeta(res.meta)
    })
  }, [search, region, page])

  return (
    <MainCard title="Daftar Toko">
      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari SAP ID / Nama / Outlet..."
          className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm w-64 focus:outline-none focus:border-[#04a9f5]"
        />
        <select
          value={region}
          onChange={(e) => { setRegion(e.target.value); setPage(1) }}
          className="border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]"
        >
          <option value="">Semua Region</option>
          {['R1', 'R2', 'R3', 'R4', 'R5'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button onClick={() => navigate('/stores/upload')} className="btn-primary ml-auto">
          Upload Toko
        </button>
      </div>

      <Table
        columns={[
          { key: 'sap_id', label: 'SAP ID', sortable: true },
          { key: 'outlet_name', label: 'Nama Toko', sortable: true },
          { key: 'outlet_id', label: 'Outlet', sortable: true },
          { key: 'region', label: 'Region', sortable: true },
          {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (row: Store) => <Badge variant={badgeVariant(row.category)}>{row.category}</Badge>,
          },
          {
            key: 'oos',
            label: 'OOS',
            sortable: true,
            render: (row: Store) => (
              <span className={row.oos === 'YES' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {row.oos}
              </span>
            ),
          },
          {
            key: 'latest_delivery',
            label: 'Kirim',
            render: (row: Store) => {
              const d = deliveryBadge(row.latest_delivery)
              return <Badge variant={d.variant}>{d.text}</Badge>
            },
          },
        ]}
        data={stores}
        onRowClick={(row) => navigate(`/stores/${row.id}`)}
      />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </MainCard>
  )
}
