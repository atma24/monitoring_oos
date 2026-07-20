import client from './client'
import type { Store, PaginatedResponse } from '../types'

export async function fetchStores(params?: Record<string, string>) {
  const { data } = await client.get<PaginatedResponse<Store>>('/stores', { params })
  return data
}

export async function fetchStore(id: number) {
  const { data } = await client.get<{ data: Store; stock_history: unknown[] }>(`/stores/${id}`)
  return data
}

export async function fetchStoresGeoJson() {
  const { data } = await client.get('/stores/geojson')
  return data
}
