'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Badge from '@/components/Badge';
import api from '@/lib/axios';
import Link from 'next/link';
import { Search, Upload, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface StockItem {
  id: number;
  stockdate: string;
  sap_id: string;
  outlet_name: string;
  region: string | null;
  dsi: number;
  category: 'RED' | 'YELLOW' | 'GREEN';
  og_urgent_date: string | null;
}

const badgeVariant = { RED: 'red' as const, YELLOW: 'yellow' as const, GREEN: 'green' as const };

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const params: Record<string, string> = { page: String(page) };
        if (categoryFilter) params.category = categoryFilter;
        const res = await api.get('/stock-records', { params });
        const d = res.data.data;
        setStocks(d.data || []);
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, categoryFilter]);

  const filtered = search
    ? stocks.filter((s) =>
        s.sap_id?.toLowerCase().includes(search.toLowerCase()) ||
        s.outlet_name?.toLowerCase().includes(search.toLowerCase()))
    : stocks;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-8">
        {/* Toolbar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari SAP ID atau nama toko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="py-3 px-4 bg-gray-50 border-transparent rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
            >
              <option value="">Semua</option>
              <option value="RED">RED</option>
              <option value="YELLOW">YELLOW</option>
              <option value="GREEN">GREEN</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Link
              href="/stocks/history"
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm"
            >
              <Clock className="w-4 h-4" />
              Riwayat
            </Link>
            <Link
              href="/stocks/upload"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Stok
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse font-medium">Memuat data stok...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SAP ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Toko</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">DSI</th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors">
                        <td className="px-6 py-4 text-gray-700">{s.stockdate}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-800">{s.sap_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{s.outlet_name}</td>
                        <td className="px-6 py-4 text-gray-600">{s.region || '-'}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{Number(s.dsi || 0).toFixed(1)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={badgeVariant[s.category]}>{s.category}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Belum ada data stok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{meta.total} data — Halaman {meta.current_page} dari {meta.last_page}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === meta.last_page}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
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
