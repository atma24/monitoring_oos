import client from './client'
import type { StockRecord, PaginatedResponse } from '../types'

export async function fetchStocks(params?: { stockdate?: string; category?: string; page?: number }) {
  const { data } = await client.get<PaginatedResponse<StockRecord>>('/stocks', { params })
  return data
}

export async function fetchStockHistory(storeId: number) {
  const { data } = await client.get<{ data: StockRecord[]; store: any }>(`/stocks/${storeId}`)
  return data
}

export async function uploadStock(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/stocks/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
