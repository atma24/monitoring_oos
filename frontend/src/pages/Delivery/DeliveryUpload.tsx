import { useState } from 'react'
import FileUpload from '../../components/FileUpload'
import MainCard from '../../components/MainCard'
import { uploadDelivery } from '../../api/delivery'

export default function DeliveryUpload() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ delivered: number; undelivered: number; errors: { cust_id: string; message: string }[] } | null>(null)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await uploadDelivery(file)
      setResult(res.data)
    } catch {
      setResult({ delivered: 0, undelivered: 0, errors: [{ cust_id: '0', message: 'Upload gagal' }] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <MainCard title="Upload Delivery">
        <p className="text-sm text-[#8996a4] mb-4">
          Upload file <strong>data adop delivery.xlsx</strong> untuk mengecek status pengiriman galon.
        </p>
        <FileUpload accept=".xlsx,.xls" onUpload={handleUpload} loading={loading} />
      </MainCard>

      {result && (
        <MainCard>
          <p className="text-sm font-medium text-[#262626] mb-3">
            ✅ {result.delivered} Terkirim, ❌ {result.undelivered} Belum Terkirim
          </p>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600 uppercase">Error:</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-sm text-red-600">⚠ {e.cust_id}: {e.message}</p>
              ))}
            </div>
          )}
        </MainCard>
      )}
    </div>
  )
}
