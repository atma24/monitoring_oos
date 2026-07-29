'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function StoreUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/stores/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult({ success: true, message: res.data.message || 'Upload berhasil!' });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setResult({ success: false, message: axiosErr.response?.data?.message || 'Upload gagal.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <Link href="/stores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl"><FileSpreadsheet className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Upload Data Toko</h2>
              <p className="text-sm text-gray-500">File Excel dari SAP (.xlsx, .xls, .csv)</p>
            </div>
          </div>

          <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-300 transition-colors">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-600">{file ? file.name : 'Klik atau drag & drop file di sini'}</p>
            <p className="text-xs text-gray-400 mt-1">Format: .xlsx, .xls, .csv (max 5MB)</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </div>

          {file && (
            <button onClick={handleUpload} disabled={uploading} className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {uploading ? 'Mengupload...' : 'Upload'}
            </button>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              {result.success ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
