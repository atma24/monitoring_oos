import { mockApi } from '../lib/mock-data'
import type { Depo } from '../types'

export async function fetchDepo() {
  return mockApi.getDepo()
}

export async function fetchDepoById(id: number) {
  return mockApi.getDepoById(id)
}

export async function createDepo(input: Partial<Depo>) {
  return mockApi.createDepo(input)
}

export async function updateDepo(id: number, input: Partial<Depo>) {
  return mockApi.updateDepo(id, input)
}

export async function deleteDepo(id: number) {
  return mockApi.deleteDepo(id)
}
