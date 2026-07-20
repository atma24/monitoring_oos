import { mockApi } from '../lib/mock-data'
import type { DashboardData } from '../types'

export async function fetchDashboard() {
  return mockApi.getDashboard() as Promise<DashboardData>
}
