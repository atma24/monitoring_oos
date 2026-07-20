import { mockApi } from '../lib/mock-data'
import type { Depot } from '../types'

export async function fetchDepots() {
  return mockApi.getDepots()
}

export async function fetchDepot(id: number) {
  return mockApi.getDepot(id)
}

export async function createDepot(input: Partial<Depot>) {
  return mockApi.createDepot(input)
}

export async function updateDepot(id: number, input: Partial<Depot>) {
  return mockApi.updateDepot(id, input)
}

export async function deleteDepot(id: number) {
  return mockApi.deleteDepot(id)
}
