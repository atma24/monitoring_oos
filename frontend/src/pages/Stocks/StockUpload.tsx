import { useState } from 'react'
import FileUpload from '../../components/FileUpload'
import MainCard from '../../components/MainCard'
import { uploadStock } from '../../api/stocks'

export default function StockUpload() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: { row: number; message: string }[] } | null>(null)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await uploadStock(file)
      setResult(res.data)
    } catch {
      setResult({ success: 0, failed: 0, errors: [{ row: 0, message: 'Upload gagal' }] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <MainCard title="Upload Stok">
        <FileUpload onUpload={handleUpload} loading={loading} />
      </MainCard>

      {result && (
        <MainCard>
          <p className="text-sm font-medium text-[#262626] mb-3">
            ✅ {result.success} berhasil, ❌ {result.failed} gagal
          </p>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600 uppercase">Error:</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-sm text-red-600">⚠ Row {e.row}: {e.message}</p>
              ))}
            </div>
          )}
        </MainCard>
      )}
    </div>
  )
}
