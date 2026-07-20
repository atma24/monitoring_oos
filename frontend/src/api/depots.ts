import client from './client'
import type { Depot, PaginatedResponse } from '../types'

export async function fetchDepots() {
  const { data } = await client.get<PaginatedResponse<Depot>>('/depots')
  return data
}

export async function fetchDepot(id: number) {
  const { data } = await client.get<{ data: Depot }>(`/depots/${id}`)
  return data
}

export async function createDepot(input: Partial<Depot>) {
  const { data } = await client.post<{ data: Depot; message: string }>('/depots', input)
  return data
}

export async function updateDepot(id: number, input: Partial<Depot>) {
  const { data } = await client.put<{ data: Depot; message: string }>(`/depots/${id}`, input)
  return data
}

export async function deleteDepot(id: number) {
  const { data } = await client.delete<{ message: string }>(`/depots/${id}`)
  return data
}
