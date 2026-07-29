'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { ArrowLeft, Warehouse, Phone, MapPin } from 'lucide-react';
import type { Depo } from '@/types';

export default function DepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [depo, setDepo] = useState<Depo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/depo/${id}`)
      .then((res) => setDepo(res.data.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse font-medium">Memuat detail depo...</div>
      </AppShell>
    );
  }

  if (!depo) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <p className="text-red-500 font-medium">Depo tidak ditemukan.</p>
          <Link href="/depo" className="text-blue-600 text-sm mt-2 inline-block">Kembali</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pt-8">
        <Link href="/depo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl"><Warehouse className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{depo.name}</h2>
              <p className="text-sm text-gray-500">ID: {depo.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Alamat</p>
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                {depo.address || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kota</p>
              <p className="text-sm text-gray-700">{depo.city || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kode Pos</p>
              <p className="text-sm text-gray-700">{depo.postal_code || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kontak</p>
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                {depo.contact_person ? `${depo.contact_person} ${depo.contact_phone ? `(${depo.contact_phone})` : ''}` : depo.contact_phone || '-'}
              </p>
            </div>
            {depo.latitude && depo.longitude && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Koordinat</p>
                <p className="text-sm text-gray-700">{depo.latitude}, {depo.longitude}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
