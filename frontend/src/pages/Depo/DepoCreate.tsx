import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import MainCard from '../../components/MainCard'
import { createDepo } from '../../api/depo'

export default function DepoCreate() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createDepo({ name, address, contact_person: contactPerson, contact_phone: contactPhone })
      navigate('/depo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/depo')} className="text-sm text-[#04a9f5] hover:underline mb-4">&larr; Kembali</button>
      <MainCard title="Tambah Depo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#262626] mb-1">Nama Depo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#262626] mb-1">Alamat</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#262626] mb-1">Kontak Person</label>
              <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#262626] mb-1">No. Telepon</label>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => navigate('/depo')} className="btn-light">
              Batal
            </button>
          </div>
        </form>
      </MainCard>
    </div>
  )
}
