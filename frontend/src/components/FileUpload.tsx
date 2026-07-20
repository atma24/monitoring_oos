import { useState, useRef, type ChangeEvent } from 'react'

interface FileUploadProps {
  accept?: string
  maxSize?: number
  onUpload: (file: File) => void
  loading?: boolean
}

export default function FileUpload({ accept = '.csv,.xlsx,.xls', maxSize = 10, onUpload, loading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (f: File) => {
    if (f.size > maxSize * 1024 * 1024) {
      setError(`File maksimal ${maxSize}MB`)
      return false
    }
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    const allowed = accept.split(',').map((a) => a.trim().toLowerCase())
    if (!allowed.includes(ext)) {
      setError(`Tipe file harus ${accept}`)
      return false
    }
    setError('')
    return true
  }

  const handleFile = (f: File) => {
    if (validate(f)) setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleUpload = () => {
    if (file && !error) onUpload(file)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-colors bg-white ${
          dragOver ? 'border-[#04a9f5] bg-[#d6f0fd]' : 'border-[#dbe0e5] hover:border-[#bec8d0]'
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {file ? (
          <div>
            <p className="text-sm font-medium text-[#262626]">{file.name}</p>
            <p className="text-xs text-[#8996a4]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-[#8996a4] mb-1">Drag & drop file di sini atau klik untuk upload</p>
            <p className="text-xs text-[#bec8d0]">Format: {accept} (max {maxSize}MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {file && !error && (
        <button onClick={handleUpload} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      )}
    </div>
  )
}
