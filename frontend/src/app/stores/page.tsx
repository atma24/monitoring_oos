'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { Search, Upload, Eye, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import type { Store } from '@/types';

const ITEMS_PER_PAGE = 20;

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // --- STATE UNTUK GEOCODING BAR ---
  const [geoStatus, setGeoStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [geoProgress, setGeoProgress] = useState({ current: 0, total: 0 });
  const [geoLog, setGeoLog] = useState('');
  
  // Gunakan ref agar interval/loop bisa dihentikan jika komponen di-unmount
  const isGeocodingRef = useRef(false);

  // Fungsi untuk memuat ulang tabel toko
  const fetchStores = () => {
    api.get('/stores')
      .then((res) => setStores(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // --- LOGIKA GEOCODING OTOMATIS ---
  useEffect(() => {
    // Fungsi rekursif untuk memanggil API geocoding
    const processNextStore = async () => {
      if (!isGeocodingRef.current) return;

      try {
        const res = await api.get('/stores/geocode');
        
        if (res.data.status === 'completed') {
          setGeoStatus('completed');
          isGeocodingRef.current = false;
          fetchStores(); // Refresh tabel setelah semua selesai
          
          // Sembunyikan bar setelah 3 detik
          setTimeout(() => setGeoStatus('idle'), 3000); 
        } else if (res.data.status === 'processing') {
          const { remaining, total, result } = res.data;
          
          setGeoStatus('processing');
          setGeoProgress({ current: total - remaining, total: total });
          
          if (result.status === 'success') {
             setGeoLog(`✅ ${result.name} ditemukan`);
          } else {
             setGeoLog(`❌ ${result.name} gagal dicari`);
          }

          // Kasih jeda sedikit agar UI tidak freeze (dan sesuai batas API Geoapify)
          setTimeout(processNextStore, 1000); 
        }
      } catch (error) {
        console.error("Geocoding terhenti:", error);
        isGeocodingRef.current = false;
        setGeoStatus('idle');
      }
    };

    // Cek apakah ada toko yang belum punya koordinat
    const checkNeedGeocoding = () => {
        // Asumsi: jika ada toko di state 'stores' yang lat/lon nya null/kosong
        const needsGeocoding = stores.some(s => !s.latitude || !s.longitude);
        
        if (needsGeocoding && !isGeocodingRef.current && geoStatus !== 'completed') {
            isGeocodingRef.current = true;
            setGeoStatus('processing');
            processNextStore();
        }
    };

    if (stores.length > 0) {
        checkNeedGeocoding();
    }

    // Cleanup saat unmount
    return () => {
        isGeocodingRef.current = false;
    };
  }, [stores, geoStatus]);
  // ---------------------------------


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
        
        {/* GEOCODING PROGRESS BAR (Muncul Dinamis) */}
        {geoStatus !== 'idle' && (
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {geoStatus === 'processing' ? (
                        <div className="bg-blue-100 p-2 rounded-xl"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /></div>
                    ) : (
                        <div className="bg-green-100 p-2 rounded-xl"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-800">
                            {geoStatus === 'processing' ? 'Mencari Koordinat Toko Baru...' : 'Pencarian Selesai!'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">{geoLog || 'Memulai proses...'}</p>
                    </div>
                </div>
                <span className="text-sm font-bold text-blue-600">
                    {geoProgress.current} / {geoProgress.total}
                </span>
             </div>
             
             {/* The Bar */}
             <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${geoStatus === 'completed' ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${geoProgress.total > 0 ? (geoProgress.current / geoProgress.total) * 100 : 0}%` }}
                ></div>
             </div>
           </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
           {/* ... (Input Search dan Tombol Upload sama persis) ... */}
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
                    {/* ... (Header Tabel sama) ... */}
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SAP ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Toko</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kota</th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Lokasi</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((store) => (
                      <tr key={store.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-800">{store.sap_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{store.outlet_name}</td>
                        <td className="px-6 py-4 text-gray-600">{store.city || '-'}</td>
                        
                        {/* Tambahan Kolom Indikator Lokasi */}
                        <td className="px-6 py-4 text-center">
                            {store.latitude && store.longitude ? (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold">
                                    <MapPin className="w-3 h-3" /> Ada
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full text-xs font-bold">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Pending
                                </span>
                            )}
                        </td>

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
              {/* ... (Paginasi sama) ... */}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}