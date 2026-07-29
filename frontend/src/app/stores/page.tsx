'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { Search, Upload, Eye } from 'lucide-react';
import type { Store } from '@/types';

const ITEMS_PER_PAGE = 20;

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/stores')
      .then((res) => setStores(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return stores;
    const q = search.toLowerCase();
    return stores.filter((s) =>
      s.sap_id?.toLowerCase().includes(q) ||
      s.outlet_name?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  }, [stores, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari SAP ID, nama toko, atau kota..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
            />
          </div>
          <Link
            href="/stores/upload"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Toko
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse font-medium">Memuat data toko...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SAP ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Toko</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kota</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Depo</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((store) => (
                      <tr key={store.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-800">{store.sap_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{store.outlet_name}</td>
                        <td className="px-6 py-4 text-gray-600">{store.city || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{store.depo?.name || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/stores/${store.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                            <Eye className="w-4 h-4" />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">{search ? 'Toko tidak ditemukan.' : 'Belum ada data toko.'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{filtered.length} toko — Halaman {page} dari {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sebelumnya</button>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Selanjutnya</button>
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
