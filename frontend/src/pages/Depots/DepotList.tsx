import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import MainCard from '../../components/MainCard'
import { fetchDepots, deleteDepot } from '../../api/depots'
import type { Depot } from '../../types'

export default function DepotList() {
  const [depots, setDepots] = useState<Depot[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    fetchDepots().then((res) => {
      setDepots(res.data)
      setMeta(res.meta)
    })
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus depo ini?')) return
    await deleteDepot(id)
    window.location.reload()
  }

  return (
    <MainCard title="Daftar Depo">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/depots/new')} className="btn-primary">
          + Tambah Depo
        </button>
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Nama Depo', sortable: true },
          { key: 'address', label: 'Alamat' },
          { key: 'contact_person', label: 'Kontak Person' },
          { key: 'contact_phone', label: 'No. Telepon' },
          {
            key: 'id',
            label: 'Aksi',
            render: (row: Depot) => (
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/depots/${row.id}/edit`) }} className="text-[#04a9f5] hover:underline text-xs">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }} className="text-red-500 hover:underline text-xs">Hapus</button>
              </div>
            ),
          },
        ]}
        data={depots}
        onRowClick={(row) => navigate(`/depots/${row.id}`)}
      />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={() => {}} />
    </MainCard>
  )
}
