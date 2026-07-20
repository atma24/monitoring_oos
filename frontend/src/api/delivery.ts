import { mockApi } from '../lib/mock-data'

export async function uploadDelivery(file: File) {
  return mockApi.uploadDelivery(file)
}
