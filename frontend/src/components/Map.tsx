import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPoint {
  id: number
  name: string
  lat: number
  lng: number
  category: string
  oos: string
}

interface MapProps {
  points: MapPoint[]
  height?: string
}

const categoryColors: Record<string, string> = {
  RED: '#ef4444',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  NO_DATA: '#6b7280',
}

export default function Map({ points, height = '400px' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current).setView([-7.7956, 110.3695], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map || points.length === 0) return

    const markers = points.map((p) => {
      const color = categoryColors[p.category] || '#6b7280'
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9,
      })
      marker.bindPopup(`<b>${p.name}</b><br/>Category: ${p.category}<br/>OOS: ${p.oos}`)
      return marker
    })

    const group = L.featureGroup(markers)
    group.addTo(map)
    map.fitBounds(group.getBounds().pad(0.1))

    return () => {
      group.remove()
    }
  }, [points])

  return <div ref={mapRef} style={{ height }} className="rounded-xl border" />
}
