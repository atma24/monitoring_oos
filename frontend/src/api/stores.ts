import client from './client'
import type { Store, StockRecord, PaginatedResponse } from '../types'

export async function fetchStores(params?: { search?: string; region?: string; page?: number }) {
  const { data } = await client.get<PaginatedResponse<Store>>('/stores', { params })
  return data
}

export async function fetchStore(id: number) {
  const { data } = await client.get<{ data: Store; stock_history: StockRecord[] }>(`/stores/${id}`)
  return data
}

export async function uploadStores(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/stores/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
