'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { ArrowLeft, MapPin } from 'lucide-react';
import type { Store } from '@/types';

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/stores/${id}`)
      .then((res) => setStore(res.data.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse font-medium">Memuat detail toko...</div>
      </AppShell>
    );
  }

  if (!store) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <p className="text-red-500 font-medium">Toko tidak ditemukan.</p>
          <Link href="/stores" className="text-blue-600 text-sm mt-2 inline-block">Kembali</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pt-8">
        <Link href="/stores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl"><MapPin className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{store.outlet_name}</h2>
              <p className="text-sm text-gray-500">SAP ID: {store.sap_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Alamat</p><p className="text-sm text-gray-700">{store.street || '-'}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kota</p><p className="text-sm text-gray-700">{store.city || '-'}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kode Pos</p><p className="text-sm text-gray-700">{store.postal_code || '-'}</p></div>
            <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Depo</p><p className="text-sm text-gray-700">{store.depo?.name || '-'}</p></div>
            {store.latitude && store.longitude && (
              <div className="md:col-span-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Koordinat</p><p className="text-sm text-gray-700">{store.latitude}, {store.longitude}</p></div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
