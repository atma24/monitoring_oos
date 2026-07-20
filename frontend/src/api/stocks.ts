import { mockApi } from '../lib/mock-data'
import type { StockRecord } from '../types'

export async function fetchStocks(params?: { stockdate?: string; category?: string; oos?: string; page?: number }) {
  return mockApi.getStocks(params)
}

export async function fetchStockHistory(storeId: number) {
  return mockApi.getStockHistory(storeId) as Promise<{ data: StockRecord[]; store: any }>
}

export async function uploadStock(file: File) {
  return mockApi.uploadStock(file)
}
