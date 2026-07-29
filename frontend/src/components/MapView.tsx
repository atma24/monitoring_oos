'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoreMarker {
  sap_id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
}

interface MapViewProps {
  stores: StoreMarker[];
  height?: string;
}

const categoryColors: Record<string, string> = {
  RED: '#EF4444',
  YELLOW: '#EAB308',
  GREEN: '#22C55E',
  NO_DATA: '#9CA3AF',
};

export default function MapView({ stores, height = '400px' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-7.250445, 112.768845], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    stores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const color = categoryColors[store.category || 'NO_DATA'] || categoryColors.NO_DATA;
      const marker = L.circleMarker([store.latitude, store.longitude], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      marker.bindPopup(`
        <b>${store.name}</b><br/>
        SAP ID: ${store.sap_id}<br/>
        Status: ${store.category || 'NO DATA'}
      `);

      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.extend([store.latitude, store.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [stores]);

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: '1.5rem' }} />;
}
