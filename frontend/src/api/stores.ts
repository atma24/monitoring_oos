import { mockApi } from '../lib/mock-data'
import type { Store, StockRecord } from '../types'

export async function fetchStores(params?: { search?: string; region?: string; page?: number }) {
  return mockApi.getStores(params)
}

export async function fetchStore(id: number) {
  return mockApi.getStore(id) as Promise<{ data: Store; stock_history: StockRecord[] }>
}

export async function fetchStoresGeoJson() {
  const { data } = await mockApi.getStores()
  return {
    type: 'FeatureCollection' as const,
    features: data.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: { sap_id: s.sap_id, name: s.outlet_name, category: s.category, oos: s.oos },
    })),
  }
}
