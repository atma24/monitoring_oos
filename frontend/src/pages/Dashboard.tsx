import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import Map from '../components/Map'
import MainCard from '../components/MainCard'
import { fetchDashboard } from '../api/dashboard'
import type { DashboardData, Store } from '../types'

function getMapPoints(stores: Store[]) {
  return stores.map((s) => ({
    id: s.id,
    name: s.outlet_name,
    lat: s.latitude ?? -7.7956,
    lng: s.longitude ?? 110.3695,
    category: s.category,
    city: s.city,
  }))
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboard().then(setData)
  }, [])

  if (!data) return <div className="text-[#8996a4]">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <StatCard icon="store" label="Total Toko" value={data.stats.total_stores} />
        <StatCard icon="alert-circle" label="RED" value={data.stats.red_count} />
        <StatCard icon="clock" label="YELLOW" value={data.stats.yellow_count} />
        <StatCard icon="check-circle" label="GREEN" value={data.stats.green_count} />
        <StatCard icon="x-circle" label="Blm Kirim" value="15" />
      </div>

      <MainCard>
        <Map points={getMapPoints(data.stores)} height="450px" />
      </MainCard>
    </div>
  )
}
