'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Badge from '@/components/Badge';
import api from '@/lib/axios';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { StockHistory } from '@/types';

const badgeVariant: Record<string, 'red' | 'yellow' | 'green'> = {
  RED: 'red', YELLOW: 'yellow', GREEN: 'green',
};

export default function StockHistoryPage() {
  const [data, setData] = useState<StockHistory[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/stock-histories', { params: { page } });
        const d = res.data.data;
        setData(d.data || []);
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-8">
        <Link href="/stocks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Stocks
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-xl"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Riwayat Upload Stok</h2>
            <p className="text-sm text-gray-500">Semua data stok yang pernah di-upload</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse font-medium">Memuat riwayat...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tgl Upload</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SAP ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Toko</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock Date</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">DSI</th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((h) => (
                      <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors">
                        <td className="px-6 py-4 text-gray-500 text-xs">{h.uploaded_at ? new Date(h.uploaded_at).toLocaleString('id-ID') : '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{h.uploader?.name || '-'}</td>
                        <td className="px-6 py-4 font-mono text-gray-800">{h.sap_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{h.outlet_name}</td>
                        <td className="px-6 py-4 text-gray-700">{h.stockdate}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{Number(h.dsi || 0).toFixed(1)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={badgeVariant[h.category] || 'green'}>{h.category}</Badge>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">Belum ada riwayat upload.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{meta.total} data — Halaman {meta.current_page} dari {meta.last_page}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === meta.last_page} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Selanjutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
