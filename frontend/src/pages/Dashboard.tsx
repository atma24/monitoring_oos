import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Map from '../components/Map'
import MainCard from '../components/MainCard'
import { fetchDashboard } from '../api/dashboard'
import type { DashboardData, Store } from '../types'

function randomCoord(base: number, range: number): number {
  return parseFloat((base + (Math.random() - 0.5) * range).toFixed(6))
}

function getMapPoints(stores: Store[]) {
  const baseLat = -7.7956
  const baseLng = 110.3695
  return stores.map((s) => ({
    id: s.id,
    name: s.outlet_name,
    lat: randomCoord(baseLat, 0.15),
    lng: randomCoord(baseLng, 0.15),
    category: s.category,
    oos: s.oos,
  }))
}

const badgeVariant = (cat: string) => {
  if (cat === 'RED') return 'red'
  if (cat === 'YELLOW') return 'yellow'
  if (cat === 'GREEN') return 'green'
  return 'gray'
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboard().then(setData)
  }, [])

  if (!data) return <div className="text-[#8996a4]">Loading dashboard...</div>

  const topOos = [...data.stores]
    .filter((s) => s.oos === 'YES')
    .sort((a, b) => b.dsi - a.dsi)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <StatCard icon="store" label="Total Toko" value={data.stats.total_stores} />
        <StatCard icon="alert-triangle" label="OOS" value={data.stats.oos_count} />
        <StatCard icon="alert-circle" label="RED" value={data.stats.red_count} />
        <StatCard icon="clock" label="YELLOW" value={data.stats.yellow_count} />
        <StatCard icon="check-circle" label="GREEN" value={data.stats.green_count} />
        <StatCard icon="x-circle" label="Blm Kirim" value="15" />
      </div>

      <MainCard>
        <Map points={getMapPoints(data.stores)} height="450px" />
      </MainCard>

      <MainCard title="Top 10 Toko OOS">
        <div className="overflow-x-auto">
          <table className="pc-table w-full text-sm">
            <thead>
              <tr>
                {['SAP ID', 'Nama Toko', 'Region', 'Stock', 'DSI', 'Category'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topOos.map((s) => (
                <tr key={s.id} onClick={() => navigate(`/stores/${s.id}`)} className="cursor-pointer">
                  <td className="font-mono text-xs">{s.sap_id}</td>
                  <td className="text-[#262626] font-medium">{s.outlet_name}</td>
                  <td>{s.region}</td>
                  <td>{s.stock}</td>
                  <td>{s.dsi}</td>
                  <td><Badge variant={badgeVariant(s.category)}>{s.category}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MainCard>
    </div>
  )
}
