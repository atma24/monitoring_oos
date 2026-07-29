'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import {
  AlertCircle, TriangleAlert, Truck,
  PackageCheck,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import MapView from '@/components/MapView';
import type { DashboardData, Store } from '@/types';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [dashRes, storesRes] = await Promise.all([
          api.get(`/dashboard?date=${today}`),
          api.get('/stores'),
        ]);
        setDashboard(dashRes.data.data);
        setStores(storesRes.data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse font-medium">
          Memuat data dashboard...
        </div>
      </AppShell>
    );
  }

  if (error || !dashboard) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-red-500 bg-red-50 p-6 rounded-2xl">
          Gagal terhubung ke server. Pastikan backend Laravel berjalan.
        </div>
      </AppShell>
    );
  }

  const storeMarkers = stores
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({
      sap_id: s.sap_id,
      name: s.outlet_name,
      latitude: s.latitude!,
      longitude: s.longitude!,
      category: 'NO_DATA',
    }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<AlertCircle />} label="Kritis (RED)" value={dashboard.oos.red_alert} iconBg="bg-red-50" iconColor="text-red-500" />
          <StatCard icon={<TriangleAlert />} label="Waspada (YELLOW)" value={dashboard.oos.yellow_warning} iconBg="bg-yellow-50" iconColor="text-yellow-500" />
          <StatCard icon={<Truck />} label="Delivery" value={dashboard.delivery.total} iconBg="bg-orange-50" iconColor="text-orange-500" />
          <StatCard icon={<PackageCheck />} label="Total OOS" value={dashboard.oos.total} iconBg="bg-blue-50" iconColor="text-blue-600" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Peta Persebaran Toko</h3>
          <MapView stores={storeMarkers} height="400px" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Top 5 Depo Perhatian Khusus</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-100">
                  <th className="pb-4 font-medium px-4">NAMA DEPO</th>
                  <th className="pb-4 font-medium text-right px-4">TOTAL KASUS OOS</th>
                  <th className="pb-4 font-medium text-center px-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.top_depo_oos.map((depo, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors group">
                    <td className="py-4 px-4 font-semibold text-gray-700">{depo.depo_name}</td>
                    <td className="py-4 px-4 font-bold text-gray-800 text-right">{depo.total_cases}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">Kritis</span>
                    </td>
                  </tr>
                ))}
                {dashboard.top_depo_oos.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-500 font-medium">Tidak ada data OOS untuk hari ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
