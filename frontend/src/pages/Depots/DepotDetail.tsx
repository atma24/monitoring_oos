import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainCard from '../../components/MainCard'
import { fetchDepot } from '../../api/depots'
import type { Depot } from '../../types'

export default function DepotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [depot, setDepot] = useState<Depot | null>(null)

  useEffect(() => {
    if (id) fetchDepot(Number(id)).then((res) => setDepot(res.data))
  }, [id])

  if (!depot) return <div className="text-[#8996a4]">Loading...</div>

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/depots')} className="text-sm text-[#04a9f5] hover:underline mb-4">&larr; Kembali</button>

      <MainCard>
        <h5 className="text-base font-semibold text-[#262626] mb-4">{depot.name}</h5>
        <div className="space-y-3 text-sm">
          <div><span className="text-[#8996a4]">Alamat:</span> {depot.address || '-'}</div>
          <div><span className="text-[#8996a4]">Kontak Person:</span> {depot.contact_person || '-'}</div>
          <div><span className="text-[#8996a4]">No. Telepon:</span> {depot.contact_phone || '-'}</div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => navigate(`/depots/${depot.id}/edit`)} className="btn-primary">
            Edit
          </button>
        </div>
      </MainCard>
    </div>
  )
}
