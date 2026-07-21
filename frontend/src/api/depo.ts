import client from './client'
import type { Depo, PaginatedResponse } from '../types'

export async function fetchDepo() {
  const { data } = await client.get<PaginatedResponse<Depo>>('/depo')
  return data
}

export async function fetchDepoById(id: number) {
  const { data } = await client.get<{ data: Depo }>(`/depo/${id}`)
  return data
}

export async function createDepo(input: Partial<Depo>) {
  const { data } = await client.post<{ data: Depo; message: string }>('/depo', input)
  return data
}

export async function updateDepo(id: number, input: Partial<Depo>) {
  const { data } = await client.put<{ data: Depo; message: string }>(`/depo/${id}`, input)
  return data
}

export async function deleteDepo(id: number) {
  const { data } = await client.delete<{ message: string }>(`/depo/${id}`)
  return data
}
