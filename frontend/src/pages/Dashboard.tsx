import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { DashboardData } from '../types'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => client.get<DashboardData>('/dashboard').then((r) => r.data),
  })

  if (isLoading) return <div>Loading...</div>

  const stats = data?.stats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <StatCard icon="🏪" label="Total Toko" value={stats?.total_stores ?? 0} />
        <StatCard icon="❗" label="OOS" value={stats?.oos_count ?? 0} color="red" />
        <StatCard icon="🔴" label="RED" value={stats?.red_count ?? 0} color="red" />
        <StatCard icon="🟡" label="YELLOW" value={stats?.yellow_count ?? 0} color="yellow" />
        <StatCard icon="🟢" label="GREEN" value={stats?.green_count ?? 0} color="green" />
        <StatCard icon="🚫" label="Blm Kirim" value={0} color="orange" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500 text-center py-12">Peta Leaflet.js akan muncul di sini</p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = 'blue' }: { icon: string; label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}
