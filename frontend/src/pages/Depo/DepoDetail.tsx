import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainCard from '../../components/MainCard'
import { fetchDepoById } from '../../api/depo'
import type { Depo } from '../../types'

export default function DepoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [depo, setDepo] = useState<Depo | null>(null)

  useEffect(() => {
    if (id) fetchDepoById(Number(id)).then((res) => setDepo(res.data))
  }, [id])

  if (!depo) return <div className="text-[#8996a4]">Loading...</div>

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/depo')} className="text-sm text-[#04a9f5] hover:underline mb-4">&larr; Kembali</button>

      <MainCard>
        <h5 className="text-base font-semibold text-[#262626] mb-4">{depo.name}</h5>
        <div className="space-y-3 text-sm">
          <div><span className="text-[#8996a4]">Alamat:</span> {depo.address || '-'}</div>
          <div><span className="text-[#8996a4]">Kontak Person:</span> {depo.contact_person || '-'}</div>
          <div><span className="text-[#8996a4]">No. Telepon:</span> {depo.contact_phone || '-'}</div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => navigate(`/depo/${depo.id}/edit`)} className="btn-primary">
            Edit
          </button>
        </div>
      </MainCard>
    </div>
  )
}
